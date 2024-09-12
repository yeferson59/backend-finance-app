import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {

    constructor(private readonly usersService: UsersService) { }

    async signUp(signUpDto: SignUpDto) {
        await this.usersService.create(signUpDto);
        const data = {
            email: signUpDto.email,
            password: signUpDto.password
        };
        return this.signIn(data);
    }

    async signIn(signInDto: SignInDto) {
        const { email, password } = signInDto;
        const res = await this.usersService.findOneEmail(email);
        if (!res) throw new ForbiddenException('Credentials incorrects');
        const isUser = await bcrypt.compare(password, res.password);
        if (!isUser) throw new ForbiddenException('Credentials incorrects');
        const { password: userPassword, ...rest } = res;
        const user = {
            ...rest
        }
        return user;
    }
}
