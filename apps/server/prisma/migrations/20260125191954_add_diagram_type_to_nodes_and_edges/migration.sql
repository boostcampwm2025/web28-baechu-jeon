/*
  Warnings:

  - Added the required column `diagramType` to the `edges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diagramType` to the `nodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edges" ADD COLUMN     "diagramType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "diagramType" TEXT NOT NULL;
