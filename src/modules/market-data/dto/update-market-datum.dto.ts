import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketDatumDto } from './create-market-datum.dto';

export class UpdateMarketDatumDto extends PartialType(CreateMarketDatumDto) {}
