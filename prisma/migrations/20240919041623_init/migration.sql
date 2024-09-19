-- CreateTable
CREATE TABLE "role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "last_name" TEXT,
    "username" TEXT,
    "password" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" DATETIME,
    "image" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "authenticator" (
    "credential_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "credencial_public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credetial_device_type" TEXT NOT NULL,
    "credential_backend_up" BOOLEAN NOT NULL,
    "transports" TEXT,

    PRIMARY KEY ("user_id", "credential_id"),
    CONSTRAINT "authenticator_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT NOT NULL,
    "updated_latest" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "risk_id" INTEGER NOT NULL,
    "total_value" DECIMAL NOT NULL DEFAULT 0.0,
    "finish_date" DATETIME,
    CONSTRAINT "portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "portfolio_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "risk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "valuation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_value" DECIMAL NOT NULL DEFAULT 0.0,
    "portfolio_id" TEXT NOT NULL,
    CONSTRAINT "valuation_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "performance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_value" DECIMAL NOT NULL,
    "total_value" DECIMAL NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    CONSTRAINT "performance_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "currency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange_rate" DECIMAL NOT NULL
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL NOT NULL,
    "stock" DECIMAL NOT NULL,
    "type_transaction_id" INTEGER NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "fee" DECIMAL NOT NULL DEFAULT 0.0,
    "exchangeRate" DECIMAL,
    CONSTRAINT "transaction_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_type_transaction_id_fkey" FOREIGN KEY ("type_transaction_id") REFERENCES "type_transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "type_transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "portfolio_asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stock" DECIMAL NOT NULL,
    "weight" DECIMAL NOT NULL,
    "initial_price" DECIMAL NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    CONSTRAINT "portfolio_asset_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "portfolio_asset_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "exchange" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "crypto_asset_id" TEXT NOT NULL,
    "commodity_asset_id" INTEGER,
    "country_id" INTEGER NOT NULL,
    CONSTRAINT "exchange_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "initial_price" DECIMAL,
    "initial_date" DATETIME,
    "type_asset_id" INTEGER NOT NULL,
    "exchange_id" INTEGER NOT NULL,
    CONSTRAINT "asset_type_asset_id_fkey" FOREIGN KEY ("type_asset_id") REFERENCES "type_asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asset_exchange_id_fkey" FOREIGN KEY ("exchange_id") REFERENCES "exchange" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "type_asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "interval_time" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date_price" DATETIME NOT NULL,
    "open_price" DECIMAL NOT NULL,
    "high_price" DECIMAL NOT NULL,
    "low_price" DECIMAL NOT NULL,
    "close_price" REAL NOT NULL,
    "volume" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asset_id" TEXT NOT NULL,
    "interval_id" INTEGER NOT NULL,
    CONSTRAINT "price_history_interval_id_fkey" FOREIGN KEY ("interval_id") REFERENCES "interval_time" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "price_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock" (
    "asset_id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "sector" TEXT,
    "industry" TEXT,
    "market_cap" DECIMAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "company" TEXT,
    "dividend" DECIMAL NOT NULL DEFAULT 0.0,
    "currency_id" INTEGER NOT NULL,
    "address" TEXT,
    "official_site" TEXT,
    "latestQuarter" DATETIME NOT NULL,
    "ebitda" DECIMAL,
    CONSTRAINT "stock_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historical_stock_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_price" DATETIME NOT NULL,
    "close_price" DECIMAL NOT NULL,
    "open_price" DECIMAL,
    "high_price" DECIMAL,
    "low_price" DECIMAL,
    "volume" BIGINT,
    "dividend" DECIMAL,
    "split" DECIMAL,
    "stock_id" TEXT NOT NULL,
    CONSTRAINT "historical_stock_data_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock" ("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "etf" (
    "asset_id" TEXT NOT NULL PRIMARY KEY,
    "manager" TEXT NOT NULL,
    "dividend" DECIMAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "etf_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historical_etf_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_price" DATETIME NOT NULL,
    "close_price" DECIMAL NOT NULL,
    "open_price" DECIMAL,
    "high_price" DECIMAL,
    "low_price" DECIMAL,
    "volume" BIGINT,
    "expense_ratio" DECIMAL,
    "yield" REAL,
    "etf_id" TEXT NOT NULL,
    CONSTRAINT "historical_etf_data_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etf" ("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crypto" (
    "asset_id" TEXT NOT NULL PRIMARY KEY,
    "blockchain" TEXT,
    "ticker" TEXT NOT NULL,
    CONSTRAINT "crypto_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historical_crypto_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_price" DATETIME NOT NULL,
    "close_price" DECIMAL NOT NULL,
    "open_price" DECIMAL,
    "high_price" DECIMAL,
    "low_price" DECIMAL,
    "volume" BIGINT,
    "market_cap" BIGINT,
    "circulating_supply" DECIMAL,
    "crypto_id" TEXT NOT NULL,
    CONSTRAINT "historical_crypto_data_crypto_id_fkey" FOREIGN KEY ("crypto_id") REFERENCES "crypto" ("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commodity" (
    "asset_id" TEXT NOT NULL PRIMARY KEY,
    "market_value" REAL,
    CONSTRAINT "commodity_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historical_commodity_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_price" DATETIME NOT NULL,
    "close_price" DECIMAL NOT NULL,
    "open_price" DECIMAL,
    "high_price" DECIMAL,
    "low_price" DECIMAL,
    "volume" DECIMAL,
    "market_value" DECIMAL,
    "commodity_id" TEXT NOT NULL,
    CONSTRAINT "historical_commodity_data_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "commodity" ("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "forex" (
    "asset_id" TEXT NOT NULL PRIMARY KEY,
    "country_from_id" INTEGER NOT NULL,
    "country_to_id" INTEGER NOT NULL,
    "exchangeRate" REAL NOT NULL,
    CONSTRAINT "forex_country_from_id_fkey" FOREIGN KEY ("country_from_id") REFERENCES "country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forex_country_to_id_fkey" FOREIGN KEY ("country_to_id") REFERENCES "country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forex_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historical_forex_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_price" DATETIME NOT NULL,
    "close_price" DECIMAL NOT NULL,
    "open_price" DECIMAL,
    "high_price" DECIMAL,
    "low_price" DECIMAL,
    "spread" DECIMAL NOT NULL,
    "volume" BIGINT,
    "forex_id" TEXT NOT NULL,
    CONSTRAINT "historical_forex_data_forex_id_fkey" FOREIGN KEY ("forex_id") REFERENCES "forex" ("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "derivative" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "expiry_date" DATETIME NOT NULL,
    "maturity_date" DATETIME,
    "underlying_asset" TEXT,
    "spread" DECIMAL,
    "leverage" DECIMAL,
    "type_id" INTEGER NOT NULL,
    "forex_id" TEXT,
    "crypto_id" TEXT,
    CONSTRAINT "derivative_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "derivative_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "derivative_forex_id_fkey" FOREIGN KEY ("forex_id") REFERENCES "forex" ("asset_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "derivative_crypto_id_fkey" FOREIGN KEY ("crypto_id") REFERENCES "crypto" ("asset_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "derivative_type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    CONSTRAINT "notification_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "notification_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    CONSTRAINT "alert_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alert_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_provider_account_id_key" ON "account"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_session_token_key" ON "session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "authenticator_credential_id_key" ON "authenticator"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "currency_symbol_key" ON "currency"("symbol");

-- CreateIndex
CREATE INDEX "transaction_date_type_transaction_id_idx" ON "transaction"("date", "type_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "type_transaction_name_key" ON "type_transaction"("name");

-- CreateIndex
CREATE INDEX "portfolio_asset_date_added_portfolio_id_asset_id_idx" ON "portfolio_asset"("date_added", "portfolio_id", "asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "country_name_key" ON "country"("name");

-- CreateIndex
CREATE INDEX "asset_name_initial_date_idx" ON "asset"("name", "initial_date");

-- CreateIndex
CREATE UNIQUE INDEX "type_asset_name_key" ON "type_asset"("name");

-- CreateIndex
CREATE UNIQUE INDEX "interval_time_name_key" ON "interval_time"("name");

-- CreateIndex
CREATE INDEX "price_history_date_price_idx" ON "price_history"("date_price");

-- CreateIndex
CREATE UNIQUE INDEX "stock_ticker_key" ON "stock"("ticker");

-- CreateIndex
CREATE INDEX "stock_sector_industry_idx" ON "stock"("sector", "industry");

-- CreateIndex
CREATE INDEX "historical_stock_data_date_price_idx" ON "historical_stock_data"("date_price");

-- CreateIndex
CREATE INDEX "historical_etf_data_date_price_idx" ON "historical_etf_data"("date_price");

-- CreateIndex
CREATE INDEX "historical_crypto_data_date_price_idx" ON "historical_crypto_data"("date_price");

-- CreateIndex
CREATE INDEX "historical_commodity_data_date_price_idx" ON "historical_commodity_data"("date_price");

-- CreateIndex
CREATE INDEX "historical_forex_data_date_price_idx" ON "historical_forex_data"("date_price");

-- CreateIndex
CREATE UNIQUE INDEX "derivative_type_name_key" ON "derivative_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "notification_type_name_key" ON "notification_type"("name");
