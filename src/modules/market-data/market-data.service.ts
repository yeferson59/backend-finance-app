import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Stock, Prisma } from '@prisma/client';

import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY; // Cambia esto por tu API Key
  private readonly alphaVantageBaseUrl = 'https://www.alphavantage.co/query';

  constructor(
    private readonly prisma: PrismaService
  ) { }

  // 1. Obtener información de una acción
  async getStock(ticker: string): Promise<Stock | null> {
    const userFound = await this.prisma.stock.findUnique({ where: { ticker } });
    if (!userFound) return null
    return userFound
  }

  // 2. Crear o actualizar información de una acción
  async upsertStock(stockData: Partial<Stock>): Promise<Stock> {
    if (!stockData.ticker) {
      throw new Error('Symbol is required');
    }

    const { assetId, createdAt, updatedAt, ...rest } = stockData; // Remover campos innecesarios

    return this.prisma.stock.upsert({
      where: { ticker: stockData.ticker },
      create: rest as Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>,
      update: rest as Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>,
    });
  }

  // Nuevo método: Obtener precios en un rango de fechas
  async getStockPricesInDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date
  ) {
    const stock = await this.getStock(symbol);
    if (!stock) throw new Error(`Stock with symbol ${symbol} not found`);

    return this.prisma.historicalStockData.findMany({
      where: {
        stockId: stock.assetId,
        datePrice: {
          gte: startDate,  // Fecha de inicio (greater than or equal)
          lte: endDate,    // Fecha de fin (less than or equal)
        },
      },
      orderBy: { datePrice: 'asc' },  // Ordena los resultados por fecha ascendente
    });
  }

  // 3. Obtener precios históricos de una acción
  async getStockPrices(
    symbol: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
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
    const whereClause: any = { stockId: stock.assetId };

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
    return this.prisma.historicalStockData.findMany({
      where: whereClause,
      orderBy: { datePrice: 'asc' },
    });
  }


  // 4. Actualizar precios históricos de una acción desde Alpha Vantage
  async updateStockPricesFromAlphaVantage(
    symbol: string,
    outputSize: 'compact' | 'full' = 'compact',
  ) {
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

      const asset = await this.createAsset(stockOverview);

      // Upsert the stock (crear o actualizar la acción)
      const stock = await this.upsertStock({
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
          stockId: stock.assetId,
        }),
      );

      // Bulk insert/update stock prices using a transaction
      //const bulkUpsertPromises = stockPrices.map((price) =>
      //  this.prisma.historicalStockData.upsert({
      //    where: { datePrice: },
      //    create: price,
      //    update: {
      //      openPrice: price.openPrice,
      //      highPrice: price.highPrice,
      //      lowPrice: price.lowPrice,
      //      closePrice: price.closePrice,
      //      volume: price.volume,
      //    },
      //  }),
      //);

      //await this.prisma.$transaction(bulkUpsertPromises);

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
        await this.updateStockPricesFromAlphaVantage(stock.ticker);
      } catch (error) {
        this.logger.error(`Failed to update prices for ${stock.ticker}: ${error.message}`);
      }
    }
  }


  async fetchStockOverview(symbol: string) {
    const url = `${this.alphaVantageBaseUrl}?function=OVERVIEW&symbol=${symbol}&apikey=${this.alphaVantageApiKey}`;
    try {
      const response = await axios.get(url);
      const data = response.data;

      if (!data || !data.Symbol) {
        this.logger.warn(`No overview data received for symbol ${symbol}`);
        throw new Error(`No overview data for ${symbol}`);
      }

      return {
        ticker: data.Symbol,
        assetType: data.AssetType,
        name: data.Name,
        description: data.Description,
        exchange: data.Exchange,
        currency: data.Currency,
        country: data.Country,
        sector: data.Sector,
        industry: data.Industry,
        marketCap: BigInt(data.MarketCapitalization),
        type: 'stock',
        dividendPerShare: BigInt(data.DividendPerShare),
        dividendYield: BigInt(data.DividendYield),
        dividendDate: new Date(data.DividendDate),
        exDividendDate: new Date(data.ExDividendDate),
        address: data.address,
        officialSite: data.OfficialSite,
        latestQuarter: data.LatestQuarter,
        ebitda: data.EBITDA,
        peRatio: data.PeRatio,
        pegRatio: data.PegRatio,
        bookValue: data.BookValue,
        eps: data.EPS,
        analystTargetPrice: data.AnalystTargetPrice,
        analystRatingStrongBuy: data.AnalystRatingStrongBuy,
        analystRatingBuy: data.AnalystRatingBuy,
        analystRatingHold: data.AnalystRatingHold,
        analystRatingSell: data.AnalystRatingSell,
        analystRatingStrongSell: data.AnalystRatingStrongSell,
        sharesOutstanding: data.SharesOutstanding
      };
    } catch (error) {
      this.logger.error(`Error fetching stock overview for ${symbol}: ${error.message}`);
      throw new Error(`Failed to fetch stock overview for ${symbol}`);
    }
  }

  private async createAsset(createAssetDto: CreateAssetDto) {
    const assetFound = await this.prisma.asset.findFirst({
      where: { name: createAssetDto.name }
    });

    if (assetFound) return null;

    const { type, country, exchange, ...rest } = createAssetDto;

    const countryAsset = await this.prisma.country.findUnique({
      where: { name: country }
    });

    if (!countryAsset) throw new NotFoundException('Country not found');

    const exchangeAsset = await this.prisma.exchange.findUnique({
      where: { name: exchange }
    });

    if (!exchangeAsset) throw new NotFoundException('Exchange not found');

    const typeAsset = await this.prisma.typeAsset.findUnique({
      where: { name: type }
    })

    if (!typeAsset) throw new NotFoundException('type asset not exist');

    const data = {
      ...rest,
      typeAssetId: typeAsset.id,
      exchangeId: exchangeAsset.id
    }

    const asset = await this.prisma.asset.create({
      data
    })

    return data
  }
}