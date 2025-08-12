import { Body, Controller, Post, Get, Put, Delete, Param, Req, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, UploadedFile } from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentEnrollIntoCourseDto } from './dto/student-enroll-course.dto';
import { UserRole } from 'src/schemas/user.schema';
import { SubscriptionGuard } from 'src/guard/plan/plan.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { HashService } from 'src/utils/utils.service';
import { MailService } from 'src/modules/mail/mail.service'; // Import MailService

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard,SubscriptionGuard)
export class StudentsController {
    constructor(
        private readonly studentsService: StudentsService,
        private readonly mailService: MailService, // Inject MailService
    ) {}

    @Post()
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('profilePicture'))
    @ApiOperation({ summary: 'Create student', description: 'Create a new student record.' })
    async createStudent(@Body() createStudentDto: CreateStudentDto, @Req() req,  @UploadedFile() file: Express.Multer.File,) {
        try {
            const schoolAdmin = req.user.id;
            const { newStudent, accountCredentials, studentPassword } = await this.studentsService.createStudent(createStudentDto, schoolAdmin, file);

            // Send email if student has an email address
            if (createStudentDto.email && createStudentDto.email !== 'none') {
                await this.mailService.sendAccountInfoEmail(
                    createStudentDto.email,
                    newStudent.firstName, // fullName
                    studentPassword,
                    UserRole.STUDENT // role
                );
            }
            
            return { newStudent, accountCredentials, studentPassword };
        } catch (error) {
            throw error;
        }
    }

    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get all students', description: 'Retrieve all students for the school.' })
    async findAllStudents(@Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.studentsService.findAllStudents(schoolAdmin);
        } catch (error) {
            throw error;
        }
    }

    @Get('student-credentials/')
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get all students', description: 'Retrieve all students for the school.' })
    async getAllStudentsCredentials(@Req() req) {
        try {
            const school = req.user.schoolId;
            return await this.studentsService.getStudentsCredentials(school);
        } catch (error) {
            throw error;
        }
    }


    @Get(':regNumber')
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    @ApiOperation({ summary: 'Get student by registration number', description: 'Retrieve a student by their registration number.' })
    async findStudentByRegistrationNumber(@Param('regNumber') regNumber: string, @Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.studentsService.findStudentByRegistrationNumber(regNumber, schoolAdmin);
        } catch (error) {
            console.error('Error fetching student:', error);
            throw error
        }
    }

    @Get('logged-student/:id')
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Get student by ID', description: 'Retrieve a student by their ID.' })
    @ApiResponse({ status: 200, description: 'Student found successfully' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async findStudentById(@Param('id') id: string, @Req() req) {
        try {
            const school = req.user.schoolId;
            return await this.studentsService.getStudentById(id, school);
        } catch (error) {
            console.error('Error fetching student:', error);
            throw error
        }
    }

    @Put(':regNumber')
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Update student', description: 'Update a student record by their registration number.' })
    async updateStudent(@Param('regNumber') regNumber: string, @Body() createStudentDto: CreateStudentDto, @Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.studentsService.updateStudent(regNumber, createStudentDto, schoolAdmin);
        } catch (error) {
            console.error('Error updating student:', error);
            throw error
        }
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Delete student', description: 'Delete a student record by their registration number.' })
    async deleteStudent(@Param('id') id: string, @Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.studentsService.deleteStudent(id, schoolAdmin);
        } catch (error) {
            throw error
        }
    }

    @Post('enroll-course')
    @ApiBearerAuth()
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Enroll student into course', description: 'Enroll a student into a course.' })
    async studentEnrollIntoCourse(@Body() studentEnrollIntoCourseDto: StudentEnrollIntoCourseDto, @Req() req) {
        try {
            const studentId = req.user.id;
            return await this.studentsService.studentEnrollIntoCourse(studentEnrollIntoCourseDto, studentId);
        } catch (error) {
            throw error
        }
    }

    @Delete('enroll-course/:studentId/:courseId')
    @ApiBearerAuth()
    @Roles(UserRole.STUDENT,UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Remove student from enrolled course', description: 'Remove a student from an enrolled course.' })
    async removeStudentFromEnroll(@Param('studentId') studentId: string, @Param('courseId') courseId: string) {
        try {
            await this.studentsService.removeStudentFromEnroll(studentId, courseId);
            return {message: "student removed successfully"}
        } catch (error) {
            throw error
        }
    }

    @Post('reset-password/:registrationNumber')
    @ApiBearerAuth()
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Reset student password', description: 'Reset the password for a student.' })
    async resetPassword(@Param('registrationNumber') registrationNumber: string) {
        return this.studentsService.resetStudentPassword(registrationNumber);
    }
}
