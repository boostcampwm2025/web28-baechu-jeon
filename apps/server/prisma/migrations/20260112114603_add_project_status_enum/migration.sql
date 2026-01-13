/*
  Warnings:

  - The `status` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UPLOADED', 'ANALYZING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "status",
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'UPLOADED';
