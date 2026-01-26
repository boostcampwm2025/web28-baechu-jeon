/*
  Warnings:

  - The `type` column on the `edges` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('SOLID', 'DASHED', 'DOTTED');

-- AlterTable
ALTER TABLE "edges" DROP COLUMN "type",
ADD COLUMN     "type" "EdgeType" NOT NULL DEFAULT 'SOLID';
