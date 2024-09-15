import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import { Axios } from 'axios';

@Module({
  controllers: [MarketDataController],
  providers: [MarketDataService, Axios],
})
export class MarketDataModule { }
