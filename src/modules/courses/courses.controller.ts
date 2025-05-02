import { Controller, Post,Body, Req, UseGuards, Put, Param, Get, Delete, Query  } from '@nestjs/common';
import { ApiTags,ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from'src/guard/jwt-auth.guard';
import { RolesGuard } from'src/guard/roles.guard';
import { Roles } from'src/decorator/roles.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UserRole } from 'src/schemas/user.schema';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { UpdateCoursetDto } from './dto/updated-course.dto';
import { TeacherAssignedCourses } from './dto/teacher-assigned-course.dto';
import { Course } from 'src/schemas/course.schema';
@ApiTags('courses')
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Post('add-course')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Create course', description: 'Create a new course record.' })
    async createCourse(@Body() createCourseDto: CreateCourseDto, @Req() req): Promise<CreateCourseDto> {
        try {
            const schoolAdmin = req.user.id;
            return await this.coursesService.createCourse(createCourseDto, schoolAdmin);
        } catch (error) {
            console.error('Error creating course:', error);
            throw new Error('Failed to create course');
        }
    }



    @Get('course-by-teacher')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get course by teacher', description: 'Get course record by teacher.' })
   async getCourseByTeacher(@Query('teacherId') teacherId: string): Promise<Course[]> {
    try {
        return await this.coursesService.getCourseByTeacher( teacherId );
    } catch (error) {
        throw error;
    }
}

    @Put('assign-teacher/:courseId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Assign teacher to course', description: 'Assign teacher to a course.' })

    async assignTeacherToCourse(@Body() assignTeacherDto: AssignTeacherDto, @Req() req , @Param('courseId') courseId:string): Promise<{}> {
        try {
            const assignedCourse = await this.coursesService.assignTeacherToCourse(courseId, assignTeacherDto);
            return { message : "Teacher assigned success",assignedCourse};
        } catch (error) {
            console.error('Error assigning teacher to course:', error);
            throw error;
        }
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get all courses for school', description: 'Get all course records.' })
    async getAllCourses(@Req() req): Promise<CreateCourseDto[]> {
        try {
            return await this.coursesService.getAllCourses(req.user.id);
        } catch (error) {
            throw error
        }
    }

    @Get(':courseId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get course by id', description: 'Get course record by id.' })
    async getCourseById(@Param('courseId') courseId: string): Promise<CreateCourseDto> {
        try {
            return await this.coursesService.getCourseById(courseId);
        } catch (error) {
            throw error;
        }
    }

    @Put(':courseId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Update course', description: 'Update course record by id.' })
    async updateCourse(@Param('courseId') courseId: string, @Body() updatedCourse: UpdateCoursetDto): Promise<CreateCourseDto> {
        try {
            return await this.coursesService.updateCourse(courseId, updatedCourse);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':courseId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SCHOOL_ADMIN)
    @ApiOperation({ summary: 'Delete course', description: 'Delete course record by id.' })
    async deleteCourse(@Param('courseId') courseId: string): Promise<void> {
        try {
            await this.coursesService.deleteCourse(courseId);
        } catch (error) {
            throw error;
        }
    }

    @Get('course-by-code/:courseCode')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get course by course code', description: 'Get course record by course code.' })
    async getCourseByCourseCode(@Param('courseCode') courseCode: string): Promise<CreateCourseDto> {
        try {
            return await this.coursesService.getCourseByCourseCode(courseCode);
        } catch (error) {
            throw error;
        }
    }
}
