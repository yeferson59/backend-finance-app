import { Controller, Get, Param, Post, Body, Put, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { Stock, StockPrice, DailySummary } from '@prisma/client';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) { }

  // 1. Obtener información de una acción por su símbolo
  @Get('stock/:symbol')
  async getStock(@Param('symbol') symbol: string): Promise<Stock | null> {
    try {
      const stock = await this.marketDataService.getStock(symbol);
      if (!stock) {
        throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
      }
      return stock;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 1. Obtener precios históricos de una acción en un intervalo de fechas
  @Get('stock/:symbol/prices/range')
  async getStockPricesInDateRange(
    @Param('symbol') symbol: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<StockPrice[]> {
    try {
      // Valida y convierte las fechas de las consultas
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }

      return await this.marketDataService.getStockPricesInDateRange(symbol, start, end);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 2. Crear o actualizar información de una acción
  @Post('stock')
  async upsertStock(@Body() stockData: Partial<Stock>): Promise<Stock> {
    try {
      return await this.marketDataService.upsertStock(stockData);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // 3. Obtener precios históricos de una acción
  @Get('stock/:symbol/prices')
  async getStockPrices(@Param('symbol') symbol: string): Promise<StockPrice[]> {
    try {
      return await this.marketDataService.getStockPrices(symbol);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 4. Actualizar precios históricos de una acción desde Alpha Vantage
  @Put('stock/:symbol/prices')
  async updateStockPrices(
    @Param('symbol') symbol: string,
    @Query('outputSize') outputSize: 'compact' | 'full' = 'compact',
  ): Promise<void> {
    try {
      await this.marketDataService.updateStockPricesFromAlphaVantage(symbol, outputSize);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 5. Obtener resumen diario del mercado
  @Get('daily-summary')
  async getDailySummary(@Query('date') date: string): Promise<DailySummary | null> {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }
      return await this.marketDataService.getDailySummary(parsedDate);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 6. Crear o actualizar el resumen diario del mercado
  @Post('daily-summary')
  async upsertDailySummary(@Body() summaryData: Partial<DailySummary>): Promise<DailySummary> {
    try {
      return await this.marketDataService.upsertDailySummary(summaryData);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}