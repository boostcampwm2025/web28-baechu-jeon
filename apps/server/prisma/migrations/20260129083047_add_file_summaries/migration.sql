-- CreateTable
CREATE TABLE "file_summaries" (
    "id" UUID NOT NULL,
    "analysis_result_id" UUID NOT NULL,
    "file_path" VARCHAR NOT NULL,
    "markdown_content" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_summaries_analysis_result_id_idx" ON "file_summaries"("analysis_result_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_summaries_analysis_result_id_file_path_key" ON "file_summaries"("analysis_result_id", "file_path");

-- AddForeignKey
ALTER TABLE "file_summaries" ADD CONSTRAINT "file_summaries_analysis_result_id_fkey" FOREIGN KEY ("analysis_result_id") REFERENCES "analysis_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
