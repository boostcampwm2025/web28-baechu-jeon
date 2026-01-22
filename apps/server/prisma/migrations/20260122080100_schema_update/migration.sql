/*
  Warnings:

  - You are about to drop the column `ai_analysis` on the `analysis_results` table. All the data in the column will be lost.
  - You are about to drop the column `current_json` on the `analysis_results` table. All the data in the column will be lost.
  - You are about to drop the column `original_json` on the `analysis_results` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `analysis_results` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `focus` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `visualizations` table. All the data in the column will be lost.
  - You are about to drop the column `z` on the `visualizations` table. All the data in the column will be lost.
  - Added the required column `step1` to the `analysis_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `step2` to the `analysis_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `step3` to the `analysis_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `step4` to the `analysis_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `analysis_result_id` to the `visualizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formatted_data` to the `visualizations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "visualizations" DROP CONSTRAINT "visualizations_project_id_fkey";

-- AlterTable
ALTER TABLE "analysis_results" DROP COLUMN "ai_analysis",
DROP COLUMN "current_json",
DROP COLUMN "original_json",
DROP COLUMN "updated_at",
ADD COLUMN     "step1" JSONB NOT NULL,
ADD COLUMN     "step2" JSONB NOT NULL,
ADD COLUMN     "step3" JSONB NOT NULL,
ADD COLUMN     "step4" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "visualizations" DROP COLUMN "color",
DROP COLUMN "description",
DROP COLUMN "focus",
DROP COLUMN "height",
DROP COLUMN "project_id",
DROP COLUMN "title",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y",
DROP COLUMN "z",
ADD COLUMN     "analysis_result_id" UUID NOT NULL,
ADD COLUMN     "formatted_data" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "nodes" (
    "id" BIGSERIAL NOT NULL,
    "visualization_id" UUID NOT NULL,
    "x" REAL NOT NULL DEFAULT 0,
    "y" REAL NOT NULL DEFAULT 0,
    "label" VARCHAR NOT NULL,
    "contents" TEXT NOT NULL,
    "groups" TEXT NOT NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_visualization_id_fkey" FOREIGN KEY ("visualization_id") REFERENCES "visualizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visualizations" ADD CONSTRAINT "visualizations_analysis_result_id_fkey" FOREIGN KEY ("analysis_result_id") REFERENCES "analysis_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
