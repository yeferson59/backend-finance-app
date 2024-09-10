import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { CreateMarketDatumDto } from './dto/create-market-datum.dto';
import { UpdateMarketDatumDto } from './dto/update-market-datum.dto';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Post()
  create(@Body() createMarketDatumDto: CreateMarketDatumDto) {
    return this.marketDataService.create(createMarketDatumDto);
  }

  @Get()
  findAll() {
    return this.marketDataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketDataService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarketDatumDto: UpdateMarketDatumDto) {
    return this.marketDataService.update(+id, updateMarketDatumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketDataService.remove(+id);
  }
}
