import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
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

    @Get('school-staff')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ 
        summary: 'Get school staff', 
        description: 'Retrieve a list of all staff members (teachers, librarians, accountants) in the school.' 
    })
    async getSchoolStaff(@Req() req: any) {
        try {
            const schoolAdminId = req.user.id;
            return await this.usersService.findUsersBySchoolAdmin(schoolAdminId);
        } catch (error) {
            console.error('Error fetching school staff:', error);
            throw new Error('Failed to fetch school staff');
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

    @Post('librarian')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ 
        summary: 'Create librarian', 
        description: 'Create a new librarian user. Only school admins can create librarians for their school.' 
    })
    @ApiBody({
        type: CreateStaffUserDto,
        description: 'Librarian creation data',
        examples: {
            librarian: {
                summary: 'Create Librarian',
                value: {
                    username: 'librarian.sarah',
                    email: 'sarah.wilson@school.com',
                    password: 'SecurePass123!',
                    phoneNumber: '+1234567890',
                    firstName: 'Sarah',
                    lastName: 'Wilson',
                    schoolId: '507f1f77bcf86cd799439011',
                    department: 'Library Department',
                    employmentType: 'Full-time',
                    startDate: '2024-01-15',
                    qualifications: 'Master of Library Science',
                    experience: '8 years in school library management'
                }
            }
        }
    })
    async createLibrarian(@Body() userData: CreateStaffUserDto, @Req() req: any) {
        try {
            const schoolAdminId = req.user.id;
            return await this.usersService.addLibrarian(userData, schoolAdminId);
        } catch (error) {
            console.log(error);
            throw new BadRequestException(error.message || 'Failed to create librarian');
        }
    }

    @Post('accountant')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ 
        summary: 'Create accountant', 
        description: 'Create a new accountant user. Only school admins can create accountants for their school.' 
    })
    @ApiBody({
        type: CreateStaffUserDto,
        description: 'Accountant creation data',
        examples: {
            accountant: {
                summary: 'Create Accountant',
                value: {
                    username: 'accountant.mike',
                    email: 'mike.johnson@school.com',
                    password: 'SecurePass123!',
                    phoneNumber: '+1234567890',
                    firstName: 'Mike',
                    lastName: 'Johnson',
                    schoolId: '507f1f77bcf86cd799439011',
                    department: 'Finance Department',
                    employmentType: 'Full-time',
                    startDate: '2024-01-15',
                    qualifications: 'Bachelor of Accounting',
                    experience: '5 years in school financial management'
                }
            }
        }
    })
    async createAccountant(@Body() userData: CreateStaffUserDto, @Req() req: any) {
        try {
            const schoolAdminId = req.user.id;
            return await this.usersService.addAccountant(userData, schoolAdminId);
        } catch (error) {
            console.log(error);
            throw new BadRequestException(error.message || 'Failed to create accountant');
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
