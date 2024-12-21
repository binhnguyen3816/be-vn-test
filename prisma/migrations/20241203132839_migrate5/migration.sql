/*
  Warnings:

  - You are about to drop the column `score` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "score",
ADD COLUMN     "totalCorrect" INTEGER,
ADD COLUMN     "totalIncorrect" INTEGER,
ADD COLUMN     "totalScore" INTEGER;
