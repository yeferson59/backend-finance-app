import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';

export class UpdateStockDto extends PartialType(CreateAssetDto) { }