import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateStudentDto } from '../students/dto/create-student.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin')
    @ApiOperation({ summary: 'Get all users', description: 'Retrieve a list of all users in the system.' })
    async getAllUsers() {
        try {
            return await this.usersService.findAllUsers();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    @Post('school-admin')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin')
    @ApiOperation({ summary: 'Create school admin', description: 'Create a new school admin user.' })
    async createSchoolAdmin(@Body() userData: CreateUserDto) {
        try {
            return await this.usersService.addSchoolAdmin(userData);
        } catch (error) {
            console.log(error);
            throw new BadRequestException(error.mesage);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve a user by their ID.' })
    async getUserById(@Param('id') id: string) {
        // Logic to get a user by ID
        return { id };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user', description: 'Update a user by their ID.' })
    async updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
        // Logic to update a user by ID
        return { id, ...userData };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user', description: 'Delete a user by their ID.' })
    async deleteUser(@Param('id') id: string) {
        // Logic to delete a user by ID
        return { id };
    }
}
