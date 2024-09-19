-- DropIndex
DROP INDEX "stock_sector_industry_idx";

-- CreateIndex
CREATE INDEX "stock_sector_industry_market_cap_exdividend_date_dividend_yield_pe_ratio_idx" ON "stock"("sector", "industry", "market_cap", "exdividend_date", "dividend_yield", "pe_ratio");
