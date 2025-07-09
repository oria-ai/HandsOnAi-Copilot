/*
  Warnings:

  - You are about to drop the `ComponentVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScreenComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskScreen` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `stepId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Conversation` table. All the data in the column will be lost.
  - The primary key for the `ConversationMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `conversationId` on the `ConversationMessage` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ConversationMessage` table. All the data in the column will be lost.
  - The primary key for the `Module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Module` table. All the data in the column will be lost.
  - The primary key for the `Step` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Step` table. All the data in the column will be lost.
  - The primary key for the `TaskSubmission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aiFeedback` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `stepId` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TaskSubmission` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aiKnowledgeLevel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `copilotLanguage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `eventData` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `screenId` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `stepId` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserEvent` table. All the data in the column will be lost.
  - The primary key for the `UserProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `lastScreen` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `progressPercent` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `stepId` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserProgress` table. All the data in the column will be lost.
  - The required column `conversation_id` was added to the `Conversation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `user_id` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversation_id` to the `ConversationMessage` table without a default value. This is not possible if the table is not empty.
  - The required column `message_id` was added to the `ConversationMessage` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `module_id` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module_id` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `step_id` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_id` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_type` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `step_id` to the `TaskSubmission` table without a default value. This is not possible if the table is not empty.
  - The required column `submission_id` was added to the `TaskSubmission` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `user_id` to the `TaskSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - The required column `event_id` was added to the `UserEvent` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `event_type` to the `UserEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `step_id` to the `UserProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `UserProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ComponentVariant_componentId_targetRole_targetAiKnowledgeLevel_targetCopilotLanguage_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ComponentVariant";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScreenComponent";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TaskScreen";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Department" (
    "dept_code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VideoStep" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "vimeo_url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ConclusionStep" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "markdown" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HandsOnTask" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "has_download_file" BOOLEAN NOT NULL,
    "download_file_url" TEXT,
    "cards_config" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "OrientationTask" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "screens" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "SkillTaskScreen" (
    "screen_id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "SkillTaskScreen_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Step" ("task_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillScreenVariant" (
    "variant_id" TEXT NOT NULL PRIMARY KEY,
    "screen_id" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "target_role" TEXT,
    "target_level" INTEGER,
    "target_lang" TEXT,
    "content" JSONB NOT NULL,
    CONSTRAINT "SkillScreenVariant_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "SkillTaskScreen" ("screen_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DepartmentModuleAssignment" (
    "dept_code" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,

    PRIMARY KEY ("dept_code", "module_id"),
    CONSTRAINT "DepartmentModuleAssignment_dept_code_fkey" FOREIGN KEY ("dept_code") REFERENCES "Department" ("dept_code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DepartmentModuleAssignment_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module" ("module_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "conversation_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "step_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Conversation_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "Step" ("step_id") ON DELETE SET NULL ON UPDATE CASCADE
);
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE TABLE "new_ConversationMessage" (
    "message_id" TEXT NOT NULL PRIMARY KEY,
    "conversation_id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationMessage_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversation" ("conversation_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConversationMessage" ("content", "sender", "timestamp") SELECT "content", "sender", "timestamp" FROM "ConversationMessage";
DROP TABLE "ConversationMessage";
ALTER TABLE "new_ConversationMessage" RENAME TO "ConversationMessage";
CREATE TABLE "new_Module" (
    "module_id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);
INSERT INTO "new_Module" ("title") SELECT "title" FROM "Module";
DROP TABLE "Module";
ALTER TABLE "new_Module" RENAME TO "Module";
CREATE TABLE "new_Step" (
    "step_id" TEXT NOT NULL PRIMARY KEY,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "task_type" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    CONSTRAINT "Step_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module" ("module_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Step" ("title") SELECT "title" FROM "Step";
DROP TABLE "Step";
ALTER TABLE "new_Step" RENAME TO "Step";
CREATE UNIQUE INDEX "Step_task_id_key" ON "Step"("task_id");
CREATE TABLE "new_TaskSubmission" (
    "submission_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" JSONB NOT NULL,
    "ai_feedback" JSONB,
    CONSTRAINT "TaskSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskSubmission_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "Step" ("step_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TaskSubmission" ("content") SELECT "content" FROM "TaskSubmission";
DROP TABLE "TaskSubmission";
ALTER TABLE "new_TaskSubmission" RENAME TO "TaskSubmission";
CREATE TABLE "new_User" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "dept_code" TEXT,
    "role" TEXT,
    "level" INTEGER,
    "language_preference" TEXT,
    CONSTRAINT "User_dept_code_fkey" FOREIGN KEY ("dept_code") REFERENCES "Department" ("dept_code") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "name", "role") SELECT "email", "name", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_UserEvent" (
    "event_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "step_id" TEXT,
    "screen_id" TEXT,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserEvent_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "Step" ("step_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserEvent_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "SkillTaskScreen" ("screen_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserEvent" ("timestamp") SELECT "timestamp" FROM "UserEvent";
DROP TABLE "UserEvent";
ALTER TABLE "new_UserEvent" RENAME TO "UserEvent";
CREATE TABLE "new_UserProgress" (
    "user_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("user_id", "step_id"),
    CONSTRAINT "UserProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserProgress_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "Step" ("step_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "UserProgress";
ALTER TABLE "new_UserProgress" RENAME TO "UserProgress";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SkillScreenVariant_screen_id_part_target_role_target_level_target_lang_key" ON "SkillScreenVariant"("screen_id", "part", "target_role", "target_level", "target_lang");
