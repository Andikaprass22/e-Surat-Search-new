-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "disposisi" TEXT,
ADD COLUMN     "jenis" TEXT,
ADD COLUMN     "lokasiArsip" TEXT,
ADD COLUMN     "penerima" TEXT,
ADD COLUMN     "pengirim" TEXT,
ADD COLUMN     "perihal" TEXT,
ADD COLUMN     "statusArsip" TEXT,
ADD COLUMN     "tanggalTerima" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "document_logs" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_logs_documentId_idx" ON "document_logs"("documentId");

-- CreateIndex
CREATE INDEX "document_logs_userId_idx" ON "document_logs"("userId");

-- CreateIndex
CREATE INDEX "documents_jenis_idx" ON "documents"("jenis");

-- CreateIndex
CREATE INDEX "documents_statusArsip_idx" ON "documents"("statusArsip");

-- AddForeignKey
ALTER TABLE "document_logs" ADD CONSTRAINT "document_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
