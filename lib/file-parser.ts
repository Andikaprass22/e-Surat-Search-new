import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

type ParseResult = { ok: true; text: string } | { ok: false; error: string };

export async function extractTextFromFile(
  file: File
): Promise<ParseResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    return extractFromDocx(file);
  }

  if (name.endsWith(".pdf")) {
    return extractFromPdf(file);
  }

  return { ok: false, error: "Format file tidak didukung. Gunakan .pdf, .docx, atau .doc." };
}

async function extractFromDocx(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });

    if (!result.value.trim()) {
      return { ok: false, error: "File DOCX kosong atau tidak mengandung teks." };
    }

    return { ok: true, text: result.value.trim() };
  } catch (err) {
    console.error("[extractFromDocx] Gagal mengekstrak teks:", err);
    const msg = err instanceof Error ? err.message : "Gagal membaca file DOCX.";
    return { ok: false, error: msg };
  }
}

async function extractFromPdf(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });
    const result = await parser.getText();
    await parser.destroy();

    if (!result.text.trim()) {
      return { ok: false, error: "File PDF kosong atau tidak mengandung teks." };
    }

    return { ok: true, text: result.text.trim() };
  } catch (err) {
    console.error("[extractFromPdf] Gagal mengekstrak teks:", err);
    const msg = err instanceof Error ? err.message : "Gagal membaca file PDF.";
    return { ok: false, error: msg };
  }
}
