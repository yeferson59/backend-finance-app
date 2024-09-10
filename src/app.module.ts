import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), PrismaModule, MarketDataModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule { }