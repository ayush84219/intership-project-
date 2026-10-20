-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT;
ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "PostedJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recruiterEmail" TEXT NOT NULL,
    "recruiterName" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "description" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "applyUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "source" TEXT NOT NULL,
    "applyUrl" TEXT,
    "status" TEXT NOT NULL,
    "coverLetter" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_jobId_key" ON "Application"("userId", "jobId");
