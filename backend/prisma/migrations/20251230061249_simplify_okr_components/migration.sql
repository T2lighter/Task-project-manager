/*
  Warnings:

  - You are about to drop the column `actionRequired` on the `ActionCheck` table. All the data in the column will be lost.
  - You are about to drop the column `checkResult` on the `ActionCheck` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `ActionCheck` table. All the data in the column will be lost.
  - You are about to drop the column `lastCheckDate` on the `ActionCheck` table. All the data in the column will be lost.
  - You are about to drop the column `nextCheckDate` on the `ActionCheck` table. All the data in the column will be lost.
  - You are about to drop the column `assignee` on the `ExecutionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `dependencies` on the `ExecutionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `ExecutionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `milestones` on the `ExecutionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `ExecutionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `ExecutionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ExecutionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `ResourceRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `ResourceRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `ResourceRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ResourceRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `requestDate` on the `ResourceRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `requiredDate` on the `ResourceRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `ResourceRequirement` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionCheck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "checkType" TEXT NOT NULL DEFAULT 'weekly',
    "criteria" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ActionCheck_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActionCheck" ("checkType", "createdAt", "criteria", "description", "id", "objectiveId", "status", "title", "updatedAt", "userId") SELECT "checkType", "createdAt", "criteria", "description", "id", "objectiveId", "status", "title", "updatedAt", "userId" FROM "ActionCheck";
DROP TABLE "ActionCheck";
ALTER TABLE "new_ActionCheck" RENAME TO "ActionCheck";
CREATE TABLE "new_ExecutionPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ExecutionPlan_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExecutionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ExecutionPlan" ("createdAt", "description", "id", "objectiveId", "phase", "title", "updatedAt", "userId") SELECT "createdAt", "description", "id", "objectiveId", "phase", "title", "updatedAt", "userId" FROM "ExecutionPlan";
DROP TABLE "ExecutionPlan";
ALTER TABLE "new_ExecutionPlan" RENAME TO "ExecutionPlan";
CREATE TABLE "new_ResourceRequirement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'requested',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ResourceRequirement_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResourceRequirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ResourceRequirement" ("createdAt", "description", "id", "objectiveId", "status", "title", "type", "updatedAt", "userId") SELECT "createdAt", "description", "id", "objectiveId", "status", "title", "type", "updatedAt", "userId" FROM "ResourceRequirement";
DROP TABLE "ResourceRequirement";
ALTER TABLE "new_ResourceRequirement" RENAME TO "ResourceRequirement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
