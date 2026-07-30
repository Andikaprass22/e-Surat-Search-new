import { cacheLife, cacheTag, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tokenize } from "./tokenizer";
import { CACHE_TAGS } from "@/lib/constants";
import { TfidfIndex, SearchResultItem } from "@/types";

export async function triggerTfidfIndexing(documentId: string): Promise<void> {
  console.log(`[triggerTfidfIndexing] Memulai indexing dokumen ID: ${documentId}`);

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { title: true, content: true },
  });

  if (!doc) {
    console.error(`[triggerTfidfIndexing] Dokumen ID ${documentId} tidak ditemukan`);
    return;
  }

  const fullText = `${doc.title} ${doc.content}`;
  const tokens = tokenize(fullText);

  if (tokens.length === 0) {
    console.log(`[triggerTfidfIndexing] Tidak ada token untuk dokumen ${documentId}, menghapus terms lama...`);
    await prisma.documentTerm.deleteMany({ where: { documentId } });
    await recalculateGlobalIdf();
    return;
  }

  const termFreq: Record<string, number> = {};
  for (const token of tokens) {
    termFreq[token] = (termFreq[token] ?? 0) + 1;
  }

  const totalTerms = tokens.length;

  await prisma.documentTerm.deleteMany({ where: { documentId } });

  const affectedTerms = Object.keys(termFreq);

  await prisma.documentTerm.createMany({
    data: affectedTerms.map((term) => ({
      documentId,
      term,
      tf: termFreq[term] / totalTerms,
      tfidf: 0,
    })),
  });

  console.log(`[triggerTfidfIndexing] ${affectedTerms.length} terms di-upsert untuk dokumen ${documentId}`);

  await recalculateGlobalIdf(affectedTerms);
}

export async function recalculateGlobalIdf(affectedTerms?: string[]): Promise<void> {
  console.log(`[recalculateGlobalIdf] terms: ${affectedTerms?.length ?? "SEMUA"}`);

  const totalDocs = await prisma.document.count();

  if (totalDocs === 0) {
    console.log("[recalculateGlobalIdf] Tidak ada dokumen, skip");
    return;
  }

  let termsToProcess: string[];

  if (affectedTerms && affectedTerms.length > 0) {
    termsToProcess = affectedTerms;
  } else {
    const allTerms = await prisma.documentTerm.findMany({
      select: { term: true },
      distinct: ["term"],
    });
    termsToProcess = allTerms.map((t) => t.term);
  }

  if (termsToProcess.length === 0) {
    console.log("[recalculateGlobalIdf] Tidak ada term untuk diproses");
    return;
  }

  const BATCH_SIZE = 200;
  for (let i = 0; i < termsToProcess.length; i += BATCH_SIZE) {
    const batch = termsToProcess.slice(i, i + BATCH_SIZE);

    const grouped = await prisma.documentTerm.groupBy({
      by: ["term"],
      where: { term: { in: batch } },
      _count: { documentId: true },
    });

    for (const g of grouped) {
      const docCount = g._count.documentId;
      const idf = Math.log(totalDocs / (docCount + 1)) + 1;

      await prisma.globalTermIdf.upsert({
        where: { term: g.term },
        create: { term: g.term, idf, docCount },
        update: { idf, docCount },
      });

      await prisma.$executeRaw`
        UPDATE document_terms
        SET tfidf = tf * ${idf}
        WHERE term = ${g.term}
      `;
    }

    const processedTerms = new Set(grouped.map((g) => g.term));
    for (const term of batch) {
      if (!processedTerms.has(term)) {
        await prisma.globalTermIdf.deleteMany({ where: { term } });
      }
    }
  }

  console.log(`[recalculateGlobalIdf] Selesai memproses ${termsToProcess.length} terms`);
}

async function rankDocuments(query: string, index: TfidfIndex): Promise<{ ranked: { docId: string; score: number; rank: number }[]; matchedDocs: { id: string; title: string; documentNumber: string; documentDate: Date; category: { name: string }; filePath: string | null }[] }> {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return { ranked: [], matchedDocs: [] };

  const queryTermFreq: Record<string, number> = {};
  for (const token of queryTokens) {
    queryTermFreq[token] = (queryTermFreq[token] ?? 0) + 1;
  }
  const queryTotal = queryTokens.length;

  const allDocIds = new Set<string>();
  for (const term of Object.keys(index)) {
    for (const docId of Object.keys(index[term].docs)) {
      allDocIds.add(docId);
    }
  }

  if (allDocIds.size === 0) return { ranked: [], matchedDocs: [] };

  const queryVec: Record<string, number> = {};
  let queryNormSq = 0;
  for (const [term, freq] of Object.entries(queryTermFreq)) {
    if (!index[term]) continue;
    const tf = freq / queryTotal;
    const tfidf = tf * index[term].idf;
    queryVec[term] = tfidf;
    queryNormSq += tfidf * tfidf;
  }
  const queryNorm = Math.sqrt(queryNormSq);

  if (queryNorm === 0) return { ranked: [], matchedDocs: [] };

  const docScores: Record<string, number> = {};
  for (const docId of allDocIds) {
    let dotProduct = 0;
    let docNormSq = 0;

    for (const [term, qVal] of Object.entries(queryVec)) {
      const docVal = index[term]?.docs[docId];
      if (docVal !== undefined) {
        dotProduct += qVal * docVal;
      }
    }

    for (const term of Object.keys(index)) {
      const val = index[term].docs[docId];
      if (val !== undefined) {
        docNormSq += val * val;
      }
    }

    const docNorm = Math.sqrt(docNormSq);
    if (docNorm > 0) {
      docScores[docId] = dotProduct / (queryNorm * docNorm);
    }
  }

  const ranked = Object.entries(docScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([docId, score], i) => ({ docId, score, rank: i + 1 }));

  const topResults = ranked.slice(0, 50);

  const matchedDocs = await prisma.document.findMany({
    where: { id: { in: topResults.map((r) => r.docId) } },
    select: {
      id: true,
      title: true,
      documentNumber: true,
      documentDate: true,
      category: { select: { name: true } },
      filePath: true,
    },
  });

  return { ranked: topResults, matchedDocs };
}

export async function computeSearchResults(query: string, index: TfidfIndex, userId: string): Promise<{ historyId: string; results: SearchResultItem[] }> {
  console.log(`[computeSearchResults] Menghitung hasil pencarian untuk: "${query}" oleh user: ${userId}`);

  const { ranked, matchedDocs } = await rankDocuments(query, index);

  if (ranked.length === 0) {
    console.log("[computeSearchResults] Tidak ada dokumen dengan skor > 0");
    return { historyId: "", results: [] };
  }

  const history = await prisma.searchHistory.create({
    data: {
      userId,
      query,
      resultCount: ranked.length,
    },
  });

  await prisma.searchResult.createMany({
    data: ranked.map((r) => ({
      searchHistoryId: history.id,
      documentId: r.docId,
      relevanceScore: r.score,
      rank: r.rank,
    })),
  });

  const docMap = new Map(matchedDocs.map((d) => [d.id, d]));

  const results: SearchResultItem[] = ranked.map((r) => {
    const doc = docMap.get(r.docId)!;
    return {
      id: "",
      dokumenId: doc.id,
      historyId: history.id,
      relevanceScore: r.score,
      dokumen: {
        judul: doc.title,
        nomorSurat: doc.documentNumber,
        tanggal: doc.documentDate,
        kategori: { nama: doc.category.name },
      },
      hasFilePath: Boolean(doc.filePath),
    };
  });

  updateTag(CACHE_TAGS.RIWAYAT(userId));
  updateTag(CACHE_TAGS.LAPORAN(userId));

  console.log(`[computeSearchResults] Selesai: ${ranked.length} hasil, historyId: ${history.id}`);

  return { historyId: history.id, results };
}

export async function searchDocuments(query: string, index: TfidfIndex): Promise<SearchResultItem[]> {
  console.log(`[searchDocuments] Pencarian langsung: "${query}"`);

  const { ranked, matchedDocs } = await rankDocuments(query, index);
  if (ranked.length === 0) return [];

  const docMap = new Map(matchedDocs.map((d) => [d.id, d]));

  return ranked.map((r) => {
    const doc = docMap.get(r.docId)!;
    return {
      id: "",
      dokumenId: doc.id,
      historyId: "",
      relevanceScore: r.score,
      dokumen: {
        judul: doc.title,
        nomorSurat: doc.documentNumber,
        tanggal: doc.documentDate,
        kategori: { nama: doc.category.name },
      },
      hasFilePath: Boolean(doc.filePath),
    };
  });
}

export async function getTfidfIndex(): Promise<TfidfIndex> {
  "use cache";
  cacheTag(CACHE_TAGS.TFIDF_INDEX);
  cacheLife("hours");

  console.log("[getTfidfIndex] Mengambil TF-IDF Index dari database...");

  const [docTerms, globalIdfs] = await Promise.all([
    prisma.documentTerm.findMany({
      select: { term: true, documentId: true, tfidf: true },
    }),
    prisma.globalTermIdf.findMany({
      select: { term: true, idf: true },
    }),
  ]);

  const idfMap: Record<string, number> = {};
  for (const g of globalIdfs) {
    idfMap[g.term] = g.idf;
  }

  const index: TfidfIndex = {};
  for (const dt of docTerms) {
    if (!index[dt.term]) {
      index[dt.term] = { idf: idfMap[dt.term] ?? 0, docs: {} };
    }
    index[dt.term].docs[dt.documentId] = dt.tfidf;
  }

  console.log(`[getTfidfIndex] Index dibangun: ${Object.keys(index).length} terms, ${docTerms.length} doc-term pairs`);

  return index;
}
