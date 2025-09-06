import { Body, Controller, Param, Post, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    async login(@Body() loginDto: LoginDto): Promise<{ message: string; token: string }> {
        return this.authService.login(loginDto);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request a password reset token (teachers, school admins, librarians & accountants only)' })
    @ApiBody({ schema: { example: { identifier: 'user@example.com' } } })
    async forgotPassword(@Body() dto: { identifier: string }) {
        return this.authService.forgotPassword(dto.identifier);
    }

    @Get('logged-in-user')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get logged in user' })
    async getLoggedInUser(@Req() req: any) {
        return this.authService.getLoggedInUser(req.user.id);
    }

    @Post('reset-password/:token')
    @ApiOperation({ summary: 'Reset password using a reset token (teachers, school admins, librarians & accountants only)' })
    @ApiParam({ name: 'token', description: 'Password reset token sent to user email' })
    @ApiBody({ schema: { example: { newPassword: 'newStrongPassword123' } } })
    async resetPassword(
        @Param('token') token: string,
        @Body() dto: { newPassword: string }
    ) {
        return this.authService.resetPassword(token, dto.newPassword);
    }

    @Get('staff-context/:userId')
    @ApiOperation({ 
        summary: 'Get staff school context', 
        description: 'Get school context information for staff members (librarians, accountants)' 
    })
    async getStaffSchoolContext(@Param('userId') userId: string) {
        return this.authService.getStaffSchoolContext(userId);
    }

}
