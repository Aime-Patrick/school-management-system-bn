import { BadRequestException, Body, Controller, Post, Get, Put, Delete, Param, Req, UseGuards, UploadedFile, UseInterceptors, UploadedFiles, NotFoundException, Patch } from '@nestjs/common';
import { SchoolService } from './school.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UserRole } from 'src/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { HashService } from 'src/utils/utils.service';
import { SubscriptionGuard } from 'src/guard/plan/plan.guard';

@ApiTags('school')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('school')
export class SchoolController {
    constructor(private readonly schoolService: SchoolService,
            private hashService: HashService,
    ) {}

    @Post()
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.SYSTEM_ADMIN)
    @UseInterceptors(FileInterceptor('schoolLogo'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create school', description: 'Create a new school record. System admin can create schools for any admin, school admin can create their own school.' })
    async createSchool(@Body() createSchoolDto: CreateSchoolDto, @UploadedFile() file: Express.Multer.File, @Req() req) {
        try {
            if (!file) {
              throw new BadRequestException(
                'No file received. Make sure you are uploading a school logo.',
              );
            }
        
            const schoolAdmin = req.user.id;
        
            const uploadedFile = await this.hashService.uploadFileToCloudinary(file);
        
            return await this.schoolService.createSchool(createSchoolDto, schoolAdmin, uploadedFile.url);
        } catch (error) {
            throw error;
        }
    }

    @Get('school-admin')
    @ApiBearerAuth()
    @UseGuards(SubscriptionGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'check if school has registered a school' })
    async isSchoolAdminHasSchool(@Req() req) {
        try {
            return await this.schoolService.isSchoolAdminHasSchool(req.user);
        } catch (error) {
            console.error('Error fetching schools:', error);
            throw error;
        }
    }

    @Put(':schoolId')
    @ApiBearerAuth()
    @UseGuards(SubscriptionGuard)
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.SYSTEM_ADMIN)
    @ApiOperation({ summary: 'Update school', description: 'Update a school record by its ID. System admin can update any school, school admin can update their own school.' })
    async updateSchool( @Body() createSchoolDto: CreateSchoolDto, @Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.schoolService.updateSchool(schoolAdmin, createSchoolDto);
        } catch (error) {
            console.error('Error updating school:', error);
            throw error;
        }
    }

    @Delete(':schoolId')
    @ApiBearerAuth()
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({ summary: 'Delete school', description: 'Delete a school record by its ID. Only system admin can delete schools.' })
    async deleteSchool(@Param('schoolId') schoolId: string, @Req() req) {
        try {
            return await this.schoolService.deleteSchool(schoolId);
        } catch (error) {
            console.error('Error deleting school:', error);
            throw error;
        }
    }

    @Get(':id/subscription-status')
    @ApiOperation({ summary: 'Check if a school has an active subscription' })
    @ApiResponse({ status: 200, description: 'Subscription status retrieved successfully' })
    @ApiResponse({ status: 404, description: 'School not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async checkSubscriptionStatus(@Param('id') schoolId: string) {
        try {
            const subscriptionStatus = await this.schoolService.checkSchoolSubscription(schoolId);
            return subscriptionStatus;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('An error occurred while checking the subscription status.');
        }
    }

    @Patch('reset-teacher-password/:teacherUserId')
    @ApiBearerAuth()
    @UseGuards(SubscriptionGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Reset a teacher\'s password and email it to them' })
    async resetTeacherPassword(
      @Param('teacherUserId') teacherUserId: string,
      @Req() req
    ) {
      const schoolAdminId = req.user.id;
      return this.schoolService.resetTeacherPassword(teacherUserId, schoolAdminId);
    }

    // School Status Management Endpoints

    @Patch(':schoolId/suspend')
    @ApiBearerAuth()
    @UseGuards(SubscriptionGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({ 
        summary: 'Suspend school', 
        description: 'Suspend a school (set status to disactive). Only system admin can suspend schools.' 
    })
    @ApiResponse({ status: 200, description: 'School suspended successfully' })
    @ApiResponse({ status: 404, description: 'School not found' })
    async suspendSchool(
        @Param('schoolId') schoolId: string,
        @Body() body: { reason?: string },
        @Req() req
    ) {
        try {
            const suspendedSchool = await this.schoolService.suspendSchool(schoolId, body.reason, req.user.id);
            
            return {
                message: 'School suspended successfully',
                school: suspendedSchool,
                reason: body.reason,
                changedBy: req.user.username
            };
        } catch (error) {
            throw error;
        }
    }

    @Patch(':schoolId/activate')
    @ApiBearerAuth()
    @UseGuards(SubscriptionGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({ 
        summary: 'Activate school', 
        description: 'Activate a school (set status to active). Only system admin can activate schools.' 
    })
    @ApiResponse({ status: 200, description: 'School activated successfully' })
    @ApiResponse({ status: 404, description: 'School not found' })
    async activateSchool(
        @Param('schoolId') schoolId: string,
        @Body() body: { reason?: string },
        @Req() req
    ) {
        try {
            const activatedSchool = await this.schoolService.activateSchool(schoolId, body.reason, req.user.id);
            
            return {
                message: 'School activated successfully',
                school: activatedSchool,
                reason: body.reason,
                changedBy: req.user.username
            };
        } catch (error) {
            throw error;
        }
    }



    @Get(':schoolId/status')
    @ApiBearerAuth()
    @UseGuards(SubscriptionGuard)
    @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
    @ApiOperation({ 
        summary: 'Check school status', 
        description: 'Check if a school is active. System admin can check any school, school admin can check their own school.' 
    })
    @ApiResponse({ status: 200, description: 'School status retrieved successfully' })
    @ApiResponse({ status: 404, description: 'School not found' })
    async checkSchoolStatus(@Param('schoolId') schoolId: string, @Req() req) {
        try {
            const isActive = await this.schoolService.isSchoolActive(schoolId);
            const school = await this.schoolService.findSchoolById(schoolId);
            
            return {
                schoolId: schoolId,
                schoolName: school.schoolName,
                status: school.status,
                isActive: isActive,
                statusReason: school.statusReason,
                statusChangedAt: school.statusChangedAt,
                statusChangedBy: school.statusChangedBy,
                message: isActive ? 'School is active' : 'School is suspended'
            };
        } catch (error) {
            throw error;
        }
    }
}
