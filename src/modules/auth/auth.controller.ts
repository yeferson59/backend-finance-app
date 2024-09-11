import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {

  constructor(private readonly usersService: UsersService) { }

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.usersService.create(signUpDto);
  }
}
