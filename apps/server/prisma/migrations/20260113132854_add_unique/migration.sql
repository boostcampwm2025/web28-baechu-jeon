/*
  Warnings:

  - A unique constraint covering the columns `[project_id]` on the table `analysis_results` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "analysis_results_project_id_key" ON "analysis_results"("project_id");
