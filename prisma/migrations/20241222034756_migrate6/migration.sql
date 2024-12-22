-- CreateEnum
CREATE TYPE "PostTag" AS ENUM ('Overall', 'Writing', 'Reading', 'Listening', 'Speaking', 'News');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "tags" "PostTag"[],
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
