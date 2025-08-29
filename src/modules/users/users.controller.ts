import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, Req, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { CreateLibrarianDto } from './dto/create-librarian.dto';
import { CreateAccountantDto } from './dto/create-accountant.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';

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
        description: 'Retrieve a list of all staff members (teachers, librarians, accountants) in the school. Note: Students are not included as they are managed separately.' 
    })
    async getSchoolStaff(@Req() req: any) {
        try {
            const schoolId = req.user.schoolId;
            if (!schoolId) {
                throw new BadRequestException('School ID not found in user token');
            }
            return await this.usersService.findUsersBySchool(schoolId);
        } catch (error) {
            console.error('Error fetching school staff:', error);
            throw new BadRequestException(error.message || 'Failed to fetch school staff');
        }
    }

    @Get('deletable-staff')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ 
        summary: 'Get deletable staff', 
        description: 'Retrieve a list of staff members that you can delete (teachers, librarians, accountants). This excludes school admins and students.' 
    })
    @ApiResponse({ status: 200, description: 'List of deletable staff members' })
    @ApiResponse({ status: 400, description: 'Bad request - school not found' })
    async getDeletableStaff(@Req() req: any) {
        try {
            const schoolId = req.user.schoolId;
            if (!schoolId) {
                throw new BadRequestException('School ID not found in user token');
            }
            return await this.usersService.getDeletableStaffForSchoolAdmin(schoolId);
        } catch (error) {
            console.error('Error fetching deletable staff:', error);
            throw new BadRequestException(error.message || 'Failed to fetch deletable staff');
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
    @UseInterceptors(FileInterceptor('profilePicture'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
        summary: 'Create librarian', 
        description: 'Create a new librarian user for your school. The school ID is automatically determined from your admin account.' 
    })
    @ApiBody({
        type: CreateLibrarianDto,
        description: 'Librarian creation data with personal and professional information',
        examples: {
            librarian: {
                summary: 'Create Librarian',
                value: {
                    firstName: 'Sarah',
                    lastName: 'Wilson',
                    dateOfBirth: '1985-05-15T00:00:00.000Z',
                    address: '123 Main St',
                    city: 'New York',
                    hiredDate: '2024-01-15T00:00:00.000Z',
                    status: 'active',
                    department: 'Library Department',
                    gender: 'Female',
                    employmentType: 'Full-time',
                    qualifications: 'Master of Library Science',
                    experience: '8 years in school library management',
                    email: 'sarah.wilson@school.com',
                    phoneNumber: '+1234567890',
                    specialization: 'Children\'s Literature',
                    certifications: ['ALA Certification'],
                    workingHours: '8:00 AM - 4:00 PM'
                }
            }
        }
    })
    async createLibrarian(
        @Body() librarianData: CreateLibrarianDto, 
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        try {
            const schoolAdminId = req.user.id;
            return await this.usersService.addLibrarian(librarianData, schoolAdminId, file);
        } catch (error) {
            console.log(error);
            throw new BadRequestException(error.message || 'Failed to create librarian');
        }
    }

    @Post('accountant')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @UseInterceptors(FileInterceptor('profilePicture'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
        summary: 'Create accountant', 
        description: 'Create a new accountant user for your school. The school ID is automatically determined from your admin account.' 
    })
    @ApiBody({
        type: CreateAccountantDto,
        description: 'Accountant creation data with personal and professional information',
        examples: {
            accountant: {
                summary: 'Create Accountant',
                value: {
                    firstName: 'Mike',
                    lastName: 'Johnson',
                    dateOfBirth: '1985-05-15T00:00:00.000Z',
                    address: '123 Main St',
                    city: 'New York',
                    hiredDate: '2024-01-15T00:00:00.000Z',
                    status: 'active',
                    department: 'Finance Department',
                    gender: 'Male',
                    employmentType: 'Full-time',
                    qualifications: 'Bachelor of Accounting',
                    experience: '5 years in school financial management',
                    email: 'mike.johnson@school.com',
                    phoneNumber: '+1234567890',
                    specialization: 'General Accounting',
                    certifications: ['CPA', 'QuickBooks Certified'],
                    workingHours: '8:00 AM - 4:00 PM',
                    softwareProficiency: ['QuickBooks', 'Excel', 'Sage']
                }
            }
        }
    })
    async createAccountant(
        @Body() accountantData: CreateAccountantDto, 
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        try {
            const schoolAdminId = req.user.id;
            return await this.usersService.addAccountant(accountantData, schoolAdminId, file);
        } catch (error) {
            console.log(error);
            throw new BadRequestException(error.message || 'Failed to create accountant');
        }
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin', 'school-admin')
    @ApiOperation({ 
        summary: 'Get user by ID', 
        description: 'Retrieve a user by their ID. System admins can view any user. School admins can only view users from their school.' 
    })
    @ApiResponse({ status: 200, description: 'User found successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserById(@Param('id') id: string, @Req() req: any) {
        try {
            const requesterId = req.user.id;
            return await this.usersService.getUserById(id, requesterId);
        } catch (error) {
            console.error('Error fetching user:', error);
            throw new BadRequestException(error.message || 'Failed to fetch user');
        }
    }

    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin', 'school-admin')
    @ApiOperation({ 
        summary: 'Update user', 
        description: 'Update a user by their ID. System admins can update any user. School admins can only update users from their school.' 
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - user not found or unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto, @Req() req: any) {
        try {
            const requesterId = req.user.id;
            return await this.usersService.updateUser(id, userData, requesterId);
        } catch (error) {
            console.error('Error updating user:', error);
            throw new BadRequestException(error.message || 'Failed to update user');
        }
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin', 'school-admin')
    @ApiOperation({ 
        summary: 'Delete user', 
        description: 'Delete a user by their ID. System admins can delete any user. School admins can only delete users from their school.' 
    })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - user not found or unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async deleteUser(@Param('id') id: string, @Req() req: any) {
        try {
            const requesterId = req.user.id;
            return await this.usersService.deleteUser(id, requesterId);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new BadRequestException(error.message || 'Failed to delete user');
        }
    }
}
