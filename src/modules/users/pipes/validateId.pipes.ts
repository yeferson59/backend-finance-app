import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ValidateIdPipe implements PipeTransform<string> {
  transform(value: string) {
    if (!isUUID(value)) {
      throw new BadRequestException('Invalid ID format');
    }
    return value;
  }
}