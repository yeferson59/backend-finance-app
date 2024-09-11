import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidateIdPipe } from './pipes/validateId.pipes';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, ValidateIdPipe],
})
export class UsersModule { }
