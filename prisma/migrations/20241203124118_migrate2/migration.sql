/*
  Warnings:

  - Added the required column `submissionId` to the `UserTestResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTestResult" ADD COLUMN     "submissionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "completionTimeSeconds" INTEGER NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTestResult" ADD CONSTRAINT "UserTestResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
