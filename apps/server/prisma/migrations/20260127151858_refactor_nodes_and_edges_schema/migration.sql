/*
  Warnings:

  - You are about to drop the column `diagramType` on the `edges` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `edges` table. All the data in the column will be lost.
  - The `groups` column on the `nodes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `diagramType` on the `nodes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DiagramType" AS ENUM ('STEP1', 'STEP2', 'STEP3');

-- CreateEnum
CREATE TYPE "NodeGroup" AS ENUM ('FE', 'BE', 'INFRA', 'DB');

-- DropIndex
DROP INDEX "nodes_visualization_id_idx";

-- AlterTable
ALTER TABLE "edges" DROP COLUMN "diagramType",
DROP COLUMN "label";

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "relatedFolders" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "contents" DROP NOT NULL,
DROP COLUMN "groups",
ADD COLUMN     "groups" "NodeGroup",
DROP COLUMN "diagramType",
ADD COLUMN     "diagramType" "DiagramType" NOT NULL;

-- CreateIndex
CREATE INDEX "nodes_visualization_id_diagramType_idx" ON "nodes"("visualization_id", "diagramType");
