/*
  Warnings:

  - You are about to drop the column `diagramType` on the `nodes` table. All the data in the column will be lost.
  - You are about to drop the column `relatedFolders` on the `nodes` table. All the data in the column will be lost.
  - Added the required column `diagram_type` to the `nodes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "nodes_visualization_id_diagramType_idx";

-- AlterTable
ALTER TABLE "nodes" DROP COLUMN "diagramType",
DROP COLUMN "relatedFolders",
ADD COLUMN     "diagram_type" "DiagramType" NOT NULL,
ADD COLUMN     "related_folders" JSONB NOT NULL DEFAULT '[]';

-- CreateIndex
CREATE INDEX "nodes_visualization_id_diagram_type_idx" ON "nodes"("visualization_id", "diagram_type");
