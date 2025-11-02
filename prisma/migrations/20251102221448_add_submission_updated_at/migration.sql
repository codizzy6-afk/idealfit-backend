-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT 'Anonymous',
    "productId" TEXT,
    "bust" REAL NOT NULL,
    "waist" REAL NOT NULL,
    "hip" REAL NOT NULL,
    "recommendedSize" TEXT NOT NULL,
    "orderId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
