import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Stock, StockPrice, DailySummary } from '@prisma/client';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly alphaVantageApiKey = 'demo'; // Cambia esto por tu API Key
  private readonly alphaVantageBaseUrl = 'https://www.alphavantage.co/query';

  constructor(
    private readonly prisma: PrismaService
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
  async getStockPrices(
    symbol: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<StockPrice[]> {
    // Primero buscamos la acción en la base de datos
    let stock = await this.getStock(symbol);

    // Si no se encuentra, hacer la petición a la API externa
    if (!stock) {
      this.logger.log(`Stock ${symbol} not found in database. Fetching from Alpha Vantage.`);
      try {
        await this.updateStockPricesFromAlphaVantage(symbol, 'full'); // Puedes usar 'compact' si quieres solo datos recientes.
        // Ahora que los datos se han obtenido, volvemos a buscar la acción
        stock = await this.getStock(symbol);
        if (!stock) {
          throw new Error(`Failed to fetch and store stock with symbol ${symbol}`);
        }
      } catch (error) {
        this.logger.error(`Error fetching stock data from Alpha Vantage: ${error.message}`);
        throw new Error(`Failed to fetch stock data from Alpha Vantage for ${symbol}`);
      }
    }

    // Definir la cláusula where para las fechas
    const whereClause: any = { stockId: stock.id };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = startDate;
      }
      if (endDate) {
        whereClause.date.lte = endDate;
      }
    }

    // Consultar los precios históricos de la acción en la base de datos
    return this.prisma.stockPrice.findMany({
      where: whereClause,
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
      const response = await axios.get(url);
      const data = response.data['Time Series (Daily)'];

      if (!data) {
        this.logger.warn(`No data received for symbol ${symbol} from Alpha Vantage`);
        return;
      }

      // Obtener la información de la acción (overview)
      const stockOverview = await this.fetchStockOverview(symbol);

      // Upsert the stock (crear o actualizar la acción)
      const stock = await this.upsertStock({
        symbol: stockOverview.symbol,
        name: stockOverview.name,
        sector: stockOverview.sector,
        industry: stockOverview.industry,
        marketCap: stockOverview.marketCap,
      });

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

      // Insertar o actualizar los precios históricos de la acción
      await this.prisma.$transaction(
        stockPrices.map((price) =>
          this.prisma.stockPrice.upsert({
            where: { date_stockId: { date: price.date, stockId: price.stockId } },
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

      this.logger.log(`Stock prices updated for ${symbol}`);
    } catch (error) {
      this.logger.error(`Error fetching stock prices from Alpha Vantage: ${error.message}`);
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

  async fetchStockOverview(symbol: string): Promise<any> {
    const url = `${this.alphaVantageBaseUrl}?function=OVERVIEW&symbol=${symbol}&apikey=${this.alphaVantageApiKey}`;
    try {
      const response = await axios.get(url);
      const data = response.data;

      if (!data || !data.Symbol) {
        this.logger.warn(`No overview data received for symbol ${symbol}`);
        throw new Error(`No overview data for ${symbol}`);
      }

      return {
        symbol: data.Symbol,
        name: data.Name,
        sector: data.Sector,
        industry: data.Industry,
        marketCap: parseInt(data.MarketCapitalization, 10) || 0,
      };
    } catch (error) {
      this.logger.error(`Error fetching stock overview for ${symbol}: ${error.message}`);
      throw new Error(`Failed to fetch stock overview for ${symbol}`);
    }
  }

}