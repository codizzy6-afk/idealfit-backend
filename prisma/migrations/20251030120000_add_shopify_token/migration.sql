-- Add shopifyAccessToken column to Merchant table
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

ALTER TABLE Merchant ADD COLUMN shopifyAccessToken TEXT;

COMMIT;
PRAGMA foreign_keys=ON;


