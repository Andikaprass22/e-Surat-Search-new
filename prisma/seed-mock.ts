import { prisma } from "@/lib/prisma";
import { tokenize } from "@/lib/tfidf/tokenizer";
import { triggerTfidfIndexing, recalculateGlobalIdf } from "@/lib/tfidf/engine";

const TEMPLATES = [
  "Keputusan Kepala Dinas tentang {topik}",
  "Surat Edaran mengenai {topik}",
  "Nota Dinas terkait {topik}",
  "Laporan Hasil Kegiatan {topik}",
  "Rencana Kerja {topik}",
  "Evaluasi Program {topik}",
  "Pedoman Teknis {topik}",
  "Surat Tugas {topik}",
  "Peraturan {topik}",
  "Pengumuman {topik}",
];

const TOPICS = [
  "Pengadaan Barang dan Jasa",
  "Realisasi Anggaran",
  "Pembangunan Infrastruktur",
  "Peningkatan SDM",
  "Sistem Informasi Manajemen",
  "Pelayanan Publik",
  "Pengelolaan Arsip",
  "Koordinasi Lintas Sektor",
  "Monitoring dan Evaluasi",
  "Penataan Kelembagaan",
  "Pengawasan Internal",
  "Pelaporan Kinerja",
  "Administrasi Keuangan",
  "Pengelolaan Aset Daerah",
  "Pengembangan Sistem Digital",
];

const KATA_PENGISI = [
  "berdasarkan", "peraturan", "perundang-undangan", "yang", "berlaku",
  "dengan", "ini", "menetapkan", "bahwa", "sehubungan",
  "telah", "dilakukan", "melalui", "secara", "tertib",
  "sebagai", "tindak", "lanjut", "dari", "kegiatan",
  "serta", "dalam", "rangka", "mendukung", "program",
  "pemerintah", "daerah", "provinsi", "kabupaten", "kota",
  "nomor", "tahun", "tanggal", "bulan", "januari", "februari", "maret",
  "april", "mei", "juni", "juli", "agustus", "september",
  "oktober", "november", "desember", "dua", "ribu", "dua puluh",
  "bahwa", "untuk", "kelancaran", "pelaksanaan", "tugas",
  "perlu", "menunjuk", "mengangkat", "memberhentikan", "pejabat",
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateContent(): string {
  const length = 50 + Math.floor(Math.random() * 150);
  const words: string[] = [];
  for (let i = 0; i < length; i++) {
    words.push(pick(KATA_PENGISI));
  }
  return words.join(" ");
}

function generateNomorSurat(index: number): string {
  const seq = String(index + 1).padStart(4, "0");
  const year = 2024 + Math.floor(Math.random() * 3);
  const code = pick(["SK", "SE", "ND", "LH", "RK", "EP", "PT", "ST", "PR", "PG"]);
  return `${seq}/${code}/TP/BNN/${year}`;
}

async function seed() {
  console.log("[seed-mock] Memulai seeding 10.000 dokumen...");

  const kategori = await prisma.category.findFirst();
  let categoryId: string;
  if (!kategori) {
    console.log("[seed-mock] Membuat kategori default...");
    const cat = await prisma.category.create({
      data: {
        name: "Dokumen Internal",
        description: "Kategori untuk dokumen seed",
      },
    });
    categoryId = cat.id;
  } else {
    categoryId = kategori.id;
  }

  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) {
    console.error("[seed-mock] Tidak ada admin ditemukan. Jalankan seed terlebih dahulu.");
    process.exit(1);
  }

  const BATCH = 100;
  const totalBatches = Math.ceil(10000 / BATCH);
  let created = 0;

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const docs = [];
    for (let i = 0; i < BATCH && created < 10000; i++) {
      const template = pick(TEMPLATES);
      const topic = pick(TOPICS);
      const judul = template.replace("{topik}", topic);
      const jenis = Math.random() > 0.5 ? "SURAT_MASUK" : "SURAT_KELUAR";
      const statusArsip = pick(["AKTIF", "RETENSI", "DIMUSNAHKAN"] as const);
      docs.push({
        title: judul,
        documentNumber: generateNomorSurat(created),
        content: generateContent(),
        documentDate: randomDate(new Date("2020-01-01"), new Date("2026-06-30")),
        categoryId,
        createdById: admin.id,
        jenis,
        statusArsip,
        pengirim: jenis === "SURAT_MASUK" ? pick(["Dinas Pendidikan", "BPKAD", "Sekretariat Daerah"]) : null,
        penerima: jenis === "SURAT_KELUAR" ? pick(["Camat", "Kepala Desa", "OPD Terkait"]) : null,
        perihal: judul,
      });
      created++;
    }

    await prisma.document.createMany({ data: docs });
    console.log(`[seed-mock] Batch ${batchIdx + 1}/${totalBatches}: ${created} dokumen dibuat`);

    for (const doc of docs) {
      await triggerTfidfIndexing(
        (await prisma.document.findFirst({ where: { documentNumber: doc.documentNumber }, select: { id: true } }))!.id
      );
    }
  }

  console.log("[seed-mock] Selesai membuat dokumen, menghitung ulang IDF global...");
  await recalculateGlobalIdf();

  console.log("[seed-mock] Benchmark pencarian...");
  const testQueries = ["kegiatan", "pengadaan", "laporan", "sistem informasi", "anggaran"];
  const index = await (await import("@/lib/tfidf/engine")).getTfidfIndex();

  for (const q of testQueries) {
    const start = performance.now();
    const { searchDocuments } = await import("@/lib/tfidf/engine");
    const results = await searchDocuments(q, index);
    const elapsed = (performance.now() - start).toFixed(1);
    console.log(`[seed-mock] Query "${q}": ${results.length} hasil dalam ${elapsed}ms`);
  }

  console.log("[seed-mock] Selesai!");
}

seed()
  .catch((err) => {
    console.error("[seed-mock] Error:", err);
    process.exit(1);
  });
