import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../../schemas/user.schema';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ message: string; token: string }> {
        return this.authService.login(loginDto);
    }

    // Define your endpoints here
    // For example, login, register, etc.
}
