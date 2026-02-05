/*
  Warnings:

  - You are about to drop the `purposes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "purposes" DROP CONSTRAINT "purposes_analysis_result_id_fkey";

-- DropTable
DROP TABLE "purposes";
