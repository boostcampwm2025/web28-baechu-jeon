/*
  Warnings:

  - The `type` column on the `nodes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('FOLDER', 'FILE');

-- AlterTable
ALTER TABLE "nodes" ALTER COLUMN "related_node_ids" SET DEFAULT ARRAY[]::BIGINT[],
ALTER COLUMN "related_paths" SET DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "type",
ADD COLUMN     "type" "NodeType";

-- DropEnum
DROP TYPE "Type";
