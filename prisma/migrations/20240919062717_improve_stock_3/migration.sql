/*
  Warnings:

  - You are about to alter the column `market_cap` on the `stock` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stock" (
    "asset_id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "sector" TEXT,
    "industry" TEXT,
    "market_cap" BIGINT,
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
INSERT INTO "new_stock" ("address", "analyst_rating_buy", "analyst_rating_hold", "analyst_rating_sell", "analyst_rating_strong_price", "analyst_rating_strong_sell", "analyst_target_price", "asset_id", "book_value", "created_at", "currency_id", "dividend_date", "dividend_per_share", "dividend_yield", "ebitda", "eps", "exdividend_date", "industry", "lastest_quater", "market_cap", "official_site", "pe_ratio", "peg_ratio", "sector", "shares_outstanding", "ticker", "updated_at") SELECT "address", "analyst_rating_buy", "analyst_rating_hold", "analyst_rating_sell", "analyst_rating_strong_price", "analyst_rating_strong_sell", "analyst_target_price", "asset_id", "book_value", "created_at", "currency_id", "dividend_date", "dividend_per_share", "dividend_yield", "ebitda", "eps", "exdividend_date", "industry", "lastest_quater", "market_cap", "official_site", "pe_ratio", "peg_ratio", "sector", "shares_outstanding", "ticker", "updated_at" FROM "stock";
DROP TABLE "stock";
ALTER TABLE "new_stock" RENAME TO "stock";
CREATE UNIQUE INDEX "stock_ticker_key" ON "stock"("ticker");
CREATE INDEX "stock_sector_industry_market_cap_exdividend_date_dividend_yield_pe_ratio_idx" ON "stock"("sector", "industry", "market_cap", "exdividend_date", "dividend_yield", "pe_ratio");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
