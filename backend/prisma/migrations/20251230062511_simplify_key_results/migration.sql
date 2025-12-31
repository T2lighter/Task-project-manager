/*
  Warnings:

  - You are about to drop the column `currentValue` on the `KeyResult` table. All the data in the column will be lost.
  - You are about to drop the column `targetValue` on the `KeyResult` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `KeyResult` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `KeyResult` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `KeyResult` table. All the data in the column will be lost.
  - You are about to drop the column `currentValue` on the `KeyResultUpdate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KeyResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not-started',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "KeyResult_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KeyResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_KeyResult" ("createdAt", "description", "id", "objectiveId", "progress", "status", "updatedAt", "userId") SELECT "createdAt", "description", "id", "objectiveId", "progress", "status", "updatedAt", "userId" FROM "KeyResult";
DROP TABLE "KeyResult";
ALTER TABLE "new_KeyResult" RENAME TO "KeyResult";
CREATE TABLE "new_KeyResultUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "progress" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keyResultId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "KeyResultUpdate_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KeyResultUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_KeyResultUpdate" ("createdAt", "id", "keyResultId", "note", "progress", "userId") SELECT "createdAt", "id", "keyResultId", "note", "progress", "userId" FROM "KeyResultUpdate";
DROP TABLE "KeyResultUpdate";
ALTER TABLE "new_KeyResultUpdate" RENAME TO "KeyResultUpdate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
