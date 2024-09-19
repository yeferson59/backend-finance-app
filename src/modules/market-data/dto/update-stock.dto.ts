import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDto } from './create-asset.dto';

export class UpdateStockDto extends PartialType(CreateStockDto) { }