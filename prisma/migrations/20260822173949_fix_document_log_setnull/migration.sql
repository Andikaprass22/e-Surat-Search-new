-- DropForeignKey
ALTER TABLE "document_logs" DROP CONSTRAINT "document_logs_documentId_fkey";

-- AlterTable
ALTER TABLE "document_logs" ALTER COLUMN "documentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "document_logs" ADD CONSTRAINT "document_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
