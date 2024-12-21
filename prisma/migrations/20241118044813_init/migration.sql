-- CreateEnum
CREATE TYPE "WritingTag" AS ENUM ('email', 'essay');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('easy', 'medium', 'hard', 'learned');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('notStarted', 'inProgress', 'completed');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "username" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetScore" DOUBLE PRECISION,
    "examDate" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTestResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "testType" TEXT,
    "readingTestId" INTEGER,
    "listeningTestId" INTEGER,
    "writingTestId" INTEGER,
    "score" INTEGER,
    "completionTimeSeconds" INTEGER,
    "totalCorrect" INTEGER DEFAULT 0,
    "totalIncorrect" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" SERIAL NOT NULL,
    "userTestResultId" INTEGER NOT NULL,
    "questionType" TEXT,
    "readingQuestionId" INTEGER,
    "listeningQuestionId" INTEGER,
    "writingQuestionId" INTEGER,
    "selectedOption" TEXT,
    "writingText" TEXT,
    "isCorrect" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "point" DOUBLE PRECISION,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TestStatus" DEFAULT 'notStarted',

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingTest" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "totalQuestions" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingPassage" (
    "id" SERIAL NOT NULL,
    "readingTestId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "readingPassage" TEXT,
    "totalQuestions" INTEGER DEFAULT 0,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingQuestion" (
    "id" SERIAL NOT NULL,
    "readingPassageId" INTEGER NOT NULL,
    "questionNumber" INTEGER,
    "questionText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingQuestionOption" (
    "id" SERIAL NOT NULL,
    "readingQuestionId" INTEGER NOT NULL,
    "optionLabel" TEXT,
    "optionText" TEXT,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningTest" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "totalQuestions" INTEGER DEFAULT 0,
    "listeningFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningSubpart" (
    "id" SERIAL NOT NULL,
    "listeningTestId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "listeningPassage" TEXT,
    "totalQuestions" INTEGER DEFAULT 0,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningSubpart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningQuestion" (
    "id" SERIAL NOT NULL,
    "listeningSubpartId" INTEGER NOT NULL,
    "questionNumber" INTEGER,
    "questionText" TEXT,
    "audioStartTime" INTEGER,
    "audioEndTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningQuestionOption" (
    "id" SERIAL NOT NULL,
    "listeningQuestionId" INTEGER NOT NULL,
    "optionLabel" TEXT,
    "optionText" TEXT,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingTest" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "totalQuestions" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSubpart" (
    "id" SERIAL NOT NULL,
    "writingTestId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "writingPassage" TEXT,
    "point" INTEGER,
    "totalQuestions" INTEGER DEFAULT 0,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingSubpart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingQuestion" (
    "id" SERIAL NOT NULL,
    "writingSubpartId" INTEGER NOT NULL,
    "question" TEXT,
    "tag" "WritingTag",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingQuestionOption" (
    "id" SERIAL NOT NULL,
    "writingQuestionId" INTEGER NOT NULL,
    "optionLabel" TEXT,
    "optionText" TEXT,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewWord" (
    "id" SERIAL NOT NULL,
    "wordListId" INTEGER NOT NULL,
    "word" TEXT,
    "definition" TEXT,
    "imageUrl" TEXT,
    "partOfSpeech" TEXT,
    "phonetic" TEXT,
    "example" TEXT,
    "notes" TEXT,
    "cardType" "CardType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingTest_testId_key" ON "ReadingTest"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "ListeningTest_testId_key" ON "ListeningTest"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "WritingTest_testId_key" ON "WritingTest"("testId");

-- AddForeignKey
ALTER TABLE "UserTestResult" ADD CONSTRAINT "UserTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestResult" ADD CONSTRAINT "ReadingTest_UserTestResult_fkey" FOREIGN KEY ("readingTestId") REFERENCES "ReadingTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestResult" ADD CONSTRAINT "ListeningTest_UserTestResult_fkey" FOREIGN KEY ("listeningTestId") REFERENCES "ListeningTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestResult" ADD CONSTRAINT "WritingTest_UserTestResult_fkey" FOREIGN KEY ("writingTestId") REFERENCES "WritingTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_userTestResultId_fkey" FOREIGN KEY ("userTestResultId") REFERENCES "UserTestResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_readingQuestionId_fkey" FOREIGN KEY ("readingQuestionId") REFERENCES "ReadingQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_listeningQuestionId_fkey" FOREIGN KEY ("listeningQuestionId") REFERENCES "ListeningQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_writingQuestionId_fkey" FOREIGN KEY ("writingQuestionId") REFERENCES "WritingQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingTest" ADD CONSTRAINT "ReadingTest_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingPassage" ADD CONSTRAINT "ReadingPassage_readingTestId_fkey" FOREIGN KEY ("readingTestId") REFERENCES "ReadingTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingQuestion" ADD CONSTRAINT "ReadingQuestion_readingPassageId_fkey" FOREIGN KEY ("readingPassageId") REFERENCES "ReadingPassage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingQuestionOption" ADD CONSTRAINT "ReadingQuestionOption_readingQuestionId_fkey" FOREIGN KEY ("readingQuestionId") REFERENCES "ReadingQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningTest" ADD CONSTRAINT "ListeningTest_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningSubpart" ADD CONSTRAINT "ListeningSubpart_listeningTestId_fkey" FOREIGN KEY ("listeningTestId") REFERENCES "ListeningTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningQuestion" ADD CONSTRAINT "ListeningQuestion_listeningSubpartId_fkey" FOREIGN KEY ("listeningSubpartId") REFERENCES "ListeningSubpart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningQuestionOption" ADD CONSTRAINT "ListeningQuestionOption_listeningQuestionId_fkey" FOREIGN KEY ("listeningQuestionId") REFERENCES "ListeningQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingTest" ADD CONSTRAINT "WritingTest_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSubpart" ADD CONSTRAINT "WritingSubpart_writingTestId_fkey" FOREIGN KEY ("writingTestId") REFERENCES "WritingTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingQuestion" ADD CONSTRAINT "WritingQuestion_writingSubpartId_fkey" FOREIGN KEY ("writingSubpartId") REFERENCES "WritingSubpart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingQuestionOption" ADD CONSTRAINT "WritingQuestionOption_writingQuestionId_fkey" FOREIGN KEY ("writingQuestionId") REFERENCES "WritingQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordList" ADD CONSTRAINT "WordList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewWord" ADD CONSTRAINT "NewWord_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
