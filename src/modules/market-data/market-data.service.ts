import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Axios } from 'axios';
import { Stock, StockPrice, DailySummary } from '@prisma/client';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly alphaVantageApiKey = 'demo'; // Cambia esto por tu API Key
  private readonly alphaVantageBaseUrl = 'https://www.alphavantage.co/query';

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: Axios,
  ) { }

  // 1. Obtener información de una acción
  async getStock(symbol: string): Promise<Stock | null> {
    const userFound = this.prisma.stock.findUnique({ where: { symbol } });
    if (!userFound) return null
    return userFound
  }

  // 2. Crear o actualizar información de una acción
  async upsertStock(stockData: Partial<Stock>): Promise<Stock> {
    if (!stockData.symbol) {
      throw new Error('Symbol is required');
    }

    const { id, createdAt, updatedAt, ...rest } = stockData; // Remover campos innecesarios

    return this.prisma.stock.upsert({
      where: { symbol: stockData.symbol },
      create: rest as Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>,
      update: rest as Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>,
    });
  }

  // Nuevo método: Obtener precios en un rango de fechas
  async getStockPricesInDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockPrice[]> {
    const stock = await this.getStock(symbol);
    if (!stock) throw new Error(`Stock with symbol ${symbol} not found`);

    return this.prisma.stockPrice.findMany({
      where: {
        stockId: stock.id,
        date: {
          gte: startDate,  // Fecha de inicio (greater than or equal)
          lte: endDate,    // Fecha de fin (less than or equal)
        },
      },
      orderBy: { date: 'asc' },  // Ordena los resultados por fecha ascendente
    });
  }

  // 3. Obtener precios históricos de una acción
  async getStockPrices(symbol: string): Promise<StockPrice[]> {
    const stock = await this.getStock(symbol);
    if (!stock) throw new Error(`Stock with symbol ${symbol} not found`);

    return this.prisma.stockPrice.findMany({
      where: { stockId: stock.id },
      orderBy: { date: 'asc' },
    });
  }

  // 4. Actualizar precios históricos de una acción desde Alpha Vantage
  async updateStockPricesFromAlphaVantage(
    symbol: string,
    outputSize: 'compact' | 'full' = 'compact',
  ): Promise<void> {
    const url = `${this.alphaVantageBaseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${this.alphaVantageApiKey}`;

    try {
      const response = await this.httpService.get(url);
      const data = response.data['Time Series (Daily)'];

      if (!data) {
        this.logger.warn(`No data received for symbol ${symbol} from Alpha Vantage`);
        return;
      }

      const stock = await this.upsertStock({ symbol });

      const stockPrices = Object.entries(data).map(
        ([date, dailyData]: [string, any]) => ({
          date: new Date(date),
          openPrice: parseFloat(dailyData['1. open']),
          highPrice: parseFloat(dailyData['2. high']),
          lowPrice: parseFloat(dailyData['3. low']),
          closePrice: parseFloat(dailyData['4. close']),
          volume: parseInt(dailyData['5. volume'], 10),
          stockId: stock.id,
        }),
      );

      // Bulk create or update stock prices in a transaction
      await this.prisma.$transaction(
        stockPrices.map((price) =>
          this.prisma.stockPrice.upsert({
            where: { date_stockId: { date: price.date, stockId: stock.id } },
            create: price,
            update: {
              openPrice: price.openPrice,
              highPrice: price.highPrice,
              lowPrice: price.lowPrice,
              closePrice: price.closePrice,
              volume: price.volume,
            },
          }),
        ),
      );

      this.logger.log(`Updated stock prices for ${symbol}`);
    } catch (error) {
      this.logger.error(
        `Error updating stock prices for ${symbol}: ${error.message}`,
      );
      throw new Error(`Failed to update stock prices for ${symbol}`);
    }
  }

  // 5. Método de cron para actualizar los precios automáticamente cada día
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCron() {
    this.logger.debug('Running scheduled market data update');
    const stocks = await this.prisma.stock.findMany();

    for (const stock of stocks) {
      try {
        await this.updateStockPricesFromAlphaVantage(stock.symbol);
      } catch (error) {
        this.logger.error(`Failed to update prices for ${stock.symbol}: ${error.message}`);
      }
    }
  }

  // 6. Obtener resumen diario del mercado
  async getDailySummary(date: Date): Promise<DailySummary | null> {
    return this.prisma.dailySummary.findUnique({
      where: { date },
    });
  }

  // 7. Crear o actualizar el resumen diario del mercado
  async upsertDailySummary(
    summaryData: Partial<DailySummary>,
  ): Promise<DailySummary> {
    const { id, createdAt, ...rest } = summaryData;

    return this.prisma.dailySummary.upsert({
      where: { date: summaryData.date },
      create: rest as Omit<DailySummary, 'id' | 'createdAt'>,
      update: rest as Omit<DailySummary, 'id' | 'createdAt'>,
    });
  }
}