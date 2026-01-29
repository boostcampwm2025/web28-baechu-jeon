/*
  Warnings:

  - You are about to drop the column `related_folders` on the `nodes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('FOLDER', 'FILE');

-- AlterTable
ALTER TABLE "nodes" DROP COLUMN "related_folders",
ADD COLUMN     "related_node_ids" BIGINT[],
ADD COLUMN     "related_paths" TEXT[],
ADD COLUMN     "type" "Type";
