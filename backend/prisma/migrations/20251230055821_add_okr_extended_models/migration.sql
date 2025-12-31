-- CreateTable
CREATE TABLE "ResourceRequirement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'other',
    "quantity" REAL,
    "unit" TEXT,
    "estimatedCost" REAL,
    "currency" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'requested',
    "requestDate" DATETIME,
    "requiredDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ResourceRequirement_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResourceRequirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecutionPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "dependencies" TEXT,
    "assignee" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "milestones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ExecutionPlan_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExecutionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionCheck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "checkType" TEXT NOT NULL DEFAULT 'weekly',
    "frequency" TEXT,
    "criteria" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastCheckDate" DATETIME,
    "nextCheckDate" DATETIME,
    "checkResult" TEXT,
    "actionRequired" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ActionCheck_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
