/*
  Warnings:

  - You are about to drop the column `company` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `dividend` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `latestQuarter` on the `stock` table. All the data in the column will be lost.
  - Added the required column `lastest_quater` to the `stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shares_outstanding` to the `stock` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stock" (
    "asset_id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "sector" TEXT,
    "industry" TEXT,
    "market_cap" DECIMAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "dividend_per_share" DECIMAL NOT NULL DEFAULT 0.0,
    "dividend_yield" DECIMAL NOT NULL DEFAULT 0.0,
    "dividend_date" DATETIME,
    "exdividend_date" DATETIME,
    "currency_id" INTEGER NOT NULL,
    "address" TEXT,
    "official_site" TEXT,
    "lastest_quater" DATETIME NOT NULL,
    "ebitda" DECIMAL,
    "pe_ratio" DECIMAL,
    "peg_ratio" DECIMAL,
    "book_value" DECIMAL,
    "eps" DECIMAL,
    "analyst_target_price" DECIMAL,
    "analyst_rating_strong_price" INTEGER NOT NULL DEFAULT 0,
    "analyst_rating_buy" INTEGER NOT NULL DEFAULT 0,
    "analyst_rating_hold" INTEGER NOT NULL DEFAULT 0,
    "analyst_rating_sell" INTEGER NOT NULL DEFAULT 0,
    "analyst_rating_strong_sell" INTEGER NOT NULL DEFAULT 0,
    "shares_outstanding" BIGINT NOT NULL,
    CONSTRAINT "stock_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_stock" ("address", "asset_id", "created_at", "currency_id", "ebitda", "industry", "market_cap", "official_site", "sector", "ticker", "updated_at") SELECT "address", "asset_id", "created_at", "currency_id", "ebitda", "industry", "market_cap", "official_site", "sector", "ticker", "updated_at" FROM "stock";
DROP TABLE "stock";
ALTER TABLE "new_stock" RENAME TO "stock";
CREATE UNIQUE INDEX "stock_ticker_key" ON "stock"("ticker");
CREATE INDEX "stock_sector_industry_idx" ON "stock"("sector", "industry");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
