import { Controller, Get, Param, Post, Body, Put, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MarketDataService } from './market-data.service';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) { }
}