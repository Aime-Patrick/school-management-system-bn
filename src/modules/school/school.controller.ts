import { BadRequestException, Body, Controller, Post, Get, Put, Delete, Param, Req, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SchoolService } from './school.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UserRole } from 'src/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { HashService } from 'src/utils/utils.service';
@ApiTags('school')
@Controller('school')
export class SchoolController {
    constructor(private readonly schoolService: SchoolService,
            private hashService: HashService,
    ) {}

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @UseInterceptors(FileInterceptor('schoolLogo'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create school', description: 'Create a new school record.' })
    async createSchool(@Body() createSchoolDto: CreateSchoolDto,@UploadedFile() file: Express.Multer.File, @Req() req) {
        try {
            if (!file) {
                throw new BadRequestException(
                  'No file received. Make sure you are uploading a file.',
                );
              }
            const schoolAdmin = req.user.id;
            const { uploadedFile } = await this.hashService.uploadFileToCloudinary(file);
            return await this.schoolService.createSchool(createSchoolDto, schoolAdmin, uploadedFile.url);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({ summary: 'Get all schools', description: 'Retrieve all schools.' })
    async findAllSchools() {
        try {
            return await this.schoolService.findAllSchools();
        } catch (error) {
            console.error('Error fetching schools:', error);
            throw error;
        }
    }

    @Get('school-admin')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'check if school has registered a school' })
    async isSchoolAdminHasSchool(@Req() req) {
        try {
            return await this.schoolService.isSchoolAdminHasSchool(req.user);
        } catch (error) {
            console.error('Error fetching schools:', error);
            throw error;
        }
    }

    @Get(':schoolId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({ summary: 'Get school by ID', description: 'Retrieve a school by its ID.' })
    async findSchoolById(@Param('schoolId') schoolId: string, @Req() req) {
        try {
            return await this.schoolService.findSchoolById(schoolId);
        } catch (error) {
            console.error('Error fetching school:', error);
            throw error;
        }
    }

    @Put(':schoolId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Update school', description: 'Update a school record by its ID.' })
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Delete school', description: 'Delete a school record by its ID.' })
    async deleteSchool(@Param('schoolId') schoolId: string, @Req() req) {
        try {
            return await this.schoolService.deleteSchool(schoolId);
        } catch (error) {
            console.error('Error deleting school:', error);
            throw error;
        }
    }
}
