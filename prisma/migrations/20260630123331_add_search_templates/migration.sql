-- CreateTable
CREATE TABLE "search_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_templates_userId_idx" ON "search_templates"("userId");
