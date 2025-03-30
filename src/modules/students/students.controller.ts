import { Body, Controller, Post, Get, Put, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentEnrollIntoCourseDto } from './dto/student-enroll-course.dto';
import { UserRole } from 'src/schemas/user.schema';

@ApiTags('students')
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin', 'teacher')
    @ApiOperation({ summary: 'Create student', description: 'Create a new student record.' })
    async createStudent(@Body() createStudentDto: CreateStudentDto, @Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.studentsService.createStudent(createStudentDto, schoolAdmin);
        } catch (error) {
            console.error('Error creating student:', error);
            throw new Error('Failed to create student');
        }
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin', 'teacher')
    @ApiOperation({ summary: 'Get all students', description: 'Retrieve all students for the school.' })
    async findAllStudents(@Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.studentsService.findAllStudents(schoolAdmin);
        } catch (error) {
            throw error;
        }
    }

    @Get(':regNumber')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Put(':regNumber')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
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

    @Delete(':regnNumber')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ summary: 'Delete student', description: 'Delete a student record by their registration number.' })
    async deleteStudent(@Param('regNumber') regNumber: string, @Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.studentsService.deleteStudent(regNumber, schoolAdmin);
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error
        }
    }

    @Post('enroll-course')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    @UseGuards(JwtAuthGuard, RolesGuard)
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
}
