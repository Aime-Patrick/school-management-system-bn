import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
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
        description: 'Retrieve a list of all staff members (teachers, librarians, accountants) in the school. Note: Students are not included as they are managed separately.' 
    })
    async getSchoolStaff(@Req() req: any) {
        try {
            const schoolAdminId = req.user.id;
            console.log('School admin ID from request:', schoolAdminId);
            console.log('User object from request:', req.user);
            return await this.usersService.findUsersBySchoolAdmin(schoolAdminId);
        } catch (error) {
            console.error('Error fetching school staff:', error);
            throw new Error('Failed to fetch school staff');
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
            const schoolAdminId = req.user.id;
            return await this.usersService.getDeletableStaffForSchoolAdmin(schoolAdminId);
        } catch (error) {
            console.error('Error fetching deletable staff:', error);
            throw new BadRequestException(error.message || 'Failed to fetch deletable staff');
        }
    }

    @Post('fix-school-associations')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ 
        summary: 'Fix school associations', 
        description: 'Fix staff users that don\'t have proper school associations. This will assign all unassigned staff to your school.' 
    })
    @ApiResponse({ status: 200, description: 'School associations fixed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - school not found' })
    async fixSchoolAssociations(@Req() req: any) {
        try {
            const schoolAdminId = req.user.id;
            return await this.usersService.fixUserSchoolAssociations(schoolAdminId);
        } catch (error) {
            console.error('Error fixing school associations:', error);
            throw new BadRequestException(error.message || 'Failed to fix school associations');
        }
    }

    @Get('debug/school-info')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ 
        summary: 'Debug school information', 
        description: 'Debug endpoint to check school-admin relationship (development only)' 
    })
    async debugSchoolInfo(@Req() req: any) {
        try {
            const schoolAdminId = req.user.id;
            console.log('Debug: School admin ID:', schoolAdminId);
            
            // Get all schools to see the structure
            const allSchools = await this.usersService['schoolModel'].find().exec();
            const adminUser = await this.usersService['userModel'].findById(schoolAdminId).exec();
            
            return {
                adminUser: {
                    id: adminUser?._id,
                    username: adminUser?.username,
                    role: adminUser?.role,
                    email: adminUser?.email
                },
                allSchools: allSchools.map(s => ({
                    id: s._id,
                    name: s.schoolName,
                    admin: s.schoolAdmin,
                    adminType: typeof s.schoolAdmin
                })),
                message: 'Debug information retrieved'
            };
        } catch (error) {
            console.error('Error in debug endpoint:', error);
            return { error: error.message };
        }
    }

    @Post('debug/create-school')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ 
        summary: 'Create test school', 
        description: 'Debug endpoint to create a test school for the admin (development only)' 
    })
    async createTestSchool(@Req() req: any) {
        try {
            const schoolAdminId = req.user.id;
            console.log('Creating test school for admin:', schoolAdminId);
            
            const newSchool = await this.usersService.createTestSchoolForAdmin(schoolAdminId);
            
            return {
                message: 'Test school created successfully',
                school: {
                    id: newSchool._id,
                    name: newSchool.schoolName,
                    code: newSchool.schoolCode,
                    admin: newSchool.schoolAdmin
                }
            };
        } catch (error) {
            console.error('Error creating test school:', error);
            return { error: error.message };
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
        description: 'Create a new librarian user for your school. The school ID is automatically determined from your admin account.' 
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
        description: 'Create a new accountant user for your school. The school ID is automatically determined from your admin account.' 
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
