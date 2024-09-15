import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateStockDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  sector: string | null;

  @IsString()
  @IsOptional()
  industry: string | null;

  @IsNumber()
  @IsOptional()
  marketCap: number | null;
}
