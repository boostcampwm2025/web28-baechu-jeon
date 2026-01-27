/*
  Warnings:

  - The `related_folders` column on the `nodes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "nodes" DROP COLUMN "related_folders",
ADD COLUMN     "related_folders" TEXT[] DEFAULT ARRAY[]::TEXT[];
