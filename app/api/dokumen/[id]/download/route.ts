import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const { id } = await params;

    const doc = await prisma.document.findUnique({
      where: { id },
      select: { id: true, title: true, filePath: true },
    });

    if (!doc || !doc.filePath) {
      return NextResponse.json(
        { error: "File tidak tersedia untuk diunduh." },
        { status: 404 }
      );
    }

    const fullPath = join(UPLOAD_DIR, doc.filePath);
    const fileStat = await stat(fullPath).catch(() => null);
    if (!fileStat) {
      return NextResponse.json(
        { error: "File tidak ditemukan di server." },
        { status: 404 }
      );
    }

    const ext = doc.filePath.split(".").pop()?.toLowerCase() ?? "bin";
    const contentType = MIME_MAP[ext] ?? "application/octet-stream";

    const buffer = await readFile(fullPath);
    const fileName = `${doc.title}.${ext}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Content-Length": String(fileStat.size),
      },
    });
  } catch (err) {
    console.error("[download] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengunduh file." },
      { status: 500 }
    );
  }
}
