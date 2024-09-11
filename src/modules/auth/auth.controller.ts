import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return "auth";
  }
}
