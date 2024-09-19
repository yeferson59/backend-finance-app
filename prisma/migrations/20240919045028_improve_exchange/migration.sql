/*
  Warnings:

  - You are about to drop the column `commodity_asset_id` on the `exchange` table. All the data in the column will be lost.
  - You are about to drop the column `crypto_asset_id` on the `exchange` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exchange" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "country_id" INTEGER NOT NULL,
    CONSTRAINT "exchange_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exchange" ("country_id", "id", "name") SELECT "country_id", "id", "name" FROM "exchange";
DROP TABLE "exchange";
ALTER TABLE "new_exchange" RENAME TO "exchange";
CREATE UNIQUE INDEX "exchange_name_key" ON "exchange"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
