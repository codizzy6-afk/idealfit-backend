/*
  Warnings:

  - You are about to drop the `CompanyMetrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SizeChart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `apiKey` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `joinedDate` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `lastActive` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `measurements` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyRevenue` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `shopUrl` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `storeName` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `webhookSecret` on the `Merchant` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopDomain` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CompanyMetrics";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Enrollment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Payment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SizeChart";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Submission";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Merchant" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "Merchant";
DROP TABLE "Merchant";
ALTER TABLE "new_Merchant" RENAME TO "Merchant";
CREATE UNIQUE INDEX "Merchant_shopDomain_key" ON "Merchant"("shopDomain");
CREATE UNIQUE INDEX "Merchant_username_key" ON "Merchant"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
