import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), PrismaModule, MarketDataModule, UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }