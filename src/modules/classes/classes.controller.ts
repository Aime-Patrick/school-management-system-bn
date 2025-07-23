import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiBody, ApiParam, getSchemaPath } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/schemas/user.schema';
import { ClassService } from './classes.service';
import { CreateCombinationDto } from './dto/create-class-combination.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { StudentIdsDto } from './dto/student-ids.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { TimetableDto } from './dto/timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new class', description: 'Create a new class record.' })
  async createClass(@Body() createClassDto: CreateClassDto, @Req() req) {
    const schoolId = req.user.schoolId;
    return this.classService.createClass(createClassDto, schoolId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get all classes',
    description: 'Retrieve all classes with optional filters for grade, subject, or teacher.',
  })
  @ApiQuery({ name: 'grade', required: false, type: String, description: 'Filter results by grade' })
  @ApiQuery({ name: 'subject', required: false, type: String, description: 'Filter results by subject' })
  @ApiQuery({ name: 'teacherId', required: false, type: String, description: 'Filter results by teacherId' })
  async getAllClasses(
    @Query('grade') grade?: string,
    @Query('subject') subject?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    try {
        return this.classService.getAllClasses(grade, subject, teacherId);
    } catch (error) {
        throw error;
    }
  }

  @Get('school/:schoolId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all classes in a school' })
  async getAllClassesInSchool(@Param('schoolId') schoolId: string) {
    return this.classService.getAllClassesInSchool(schoolId);
  }

  @Get(':classId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get class details',
    description: 'Retrieve details of a specific class by its ID.',
  })
  async getClassById(@Param('classId') classId: string) {
    try {
    return this.classService.getClassById(classId);
    } catch (error) {
        throw error;
    }
  }

  // @Put(':classId')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.SCHOOL_ADMIN)
  // @ApiOperation({
  //   summary: 'Update class details',
  //   description: 'Update the details of a specific class by its ID.',
  // })
  // async updateClass(
  //   @Param('classId') classId: string,
  //   @Body() updateClassDto: UpdateClassDto,
  // ) {
  //   try {
  //     return this.classService.updateClass(classId, updateClassDto);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Post(':classId/students')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.SCHOOL_ADMIN)
  // @ApiOperation({
  //   summary: 'Add students to a class',
  //   description: 'Add students to a specific class by their IDs.',
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       studentIds: {
  //         type: 'array',
  //         items: { type: 'string' },
  //         example: ['student1', 'student2'],
  //       },
  //     },
  //   },
  // })
  // async addStudentsToClass(
  //   @Param('classId') classId: string,
  //   @Body() dto: StudentIdsDto,
  //   @Req() req,
  // ): Promise<any> {
  //   const userId = req.user.id;
  //   return this.classService.addStudentsToClass(classId, dto.studentIds, userId);
  // }

  @Delete(':classId/students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Remove students from a class',
    description: 'Remove students from a specific class by their IDs.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['student1', 'student2'],
        },
      },
    },
  })
  async removeStudentsFromClass(
    @Param('classId') classId: string,
    @Body() dto: StudentIdsDto,
  ): Promise<any> {
    return this.classService.removeStudentsFromClass(classId, dto.studentIds);
  }

  @Get(':classId/performance')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get class performance',
    description: 'Retrieve the performance data of a specific class.',
  })
  async getClassPerformance(@Param('classId') classId: string) {
    try {
      return this.classService.calculateClassPerformance(classId);
    } catch (error) {
      throw error;
    }
  }

  @Post(':classId/combinations')
  @ApiOperation({ summary: 'Add a combination to a class' })
  @ApiParam({ name: 'classId', description: 'ID of the class' })
  @ApiBody({ type: CreateCombinationDto })
  async addCombination(@Param('classId') classId: string, @Body() dto: CreateCombinationDto) {
    return this.classService.addCombinationToClass(classId, dto);
  }

  @Put('combinations/:combinationId/teachers')
  @ApiOperation({ summary: 'Assign teachers to a class combination' })
  @ApiParam({ name: 'combinationId', description: 'ID of the class combination' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        teacherIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['teacherId1', 'teacherId2'],
        },
      },
    },
  })
  async assignTeachers(@Param('combinationId') id: string, @Body() dto: { teacherIds: string[] }) {
    return this.classService.assignTeachersToCombination(id, dto.teacherIds);
  }

  @Put('combinations/:combinationId/students')
  @ApiOperation({ summary: 'Assign students to a class combination' })
  @ApiParam({ name: 'combinationId', description: 'ID of the class combination' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['studentId1', 'studentId2'],
        },
      },
    },
  })
  async assignStudents(@Param('combinationId') id: string, @Body() dto: { studentIds: string[] }) {
    return this.classService.assignStudentsToCombination(id, dto.studentIds);
  }

  @Put('combinations/:combinationId/timetable')
  @ApiOperation({ summary: 'Assign timetable to a class combination' })
  @ApiParam({ name: 'combinationId', description: 'ID of the class combination' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timetable: {
          type: 'array',
          items: { $ref: getSchemaPath(TimetableDto) },
          example: [
            {
              day: 'Monday',
              schedule: [
                {
                  subject: 'Mathematics',
                  teacher: 'teacherId1',
                  startTime: '08:00',
                  endTime: '09:00',
                },
              ],
            },
          ],
        },
      },
    },
  })
  async assignTimetable(@Param('combinationId') id: string, @Body() dto: { timetable: TimetableDto[] }) {
    return this.classService.assignTimetableToCombination(id, dto.timetable);
  }

  @Put('combinations/:combinationId/update-timetable')
  @ApiOperation({ summary: 'Update timetable for a class combination' })
  @ApiParam({ name: 'combinationId', description: 'ID of the class combination' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timetable: {
          type: 'array',
          items: { $ref: getSchemaPath(UpdateTimetableDto) },
          example: [
            {
              day: 'Monday',
              schedule: [
                {
                  subject: 'Mathematics',
                  teacher: 'teacherId1',
                  startTime: '08:00',
                  endTime: '09:00',
                },
              ],
            },
          ],
        },
      },
    },
  })
  async updateTimetable(@Param('combinationId') id: string, @Body() dto: { timetable: UpdateTimetableDto[] }) {
    return this.classService.updateTimetableForCombination(id, dto.timetable);
  }
  @Delete(':classId')
  @ApiOperation({ summary: 'Delete a class', description: 'Delete a class by its ID.' })
  @ApiParam({ name: 'classId', description: 'ID of the class to delete' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  async deleteClass(@Param('classId') classId: string) {
    return this.classService.deleteClass(classId);
  }

  @Delete('combinations/:combinationId/delete-day-timetable')
  @ApiOperation({ summary: 'Delete a day from the timetable of a class combination' })
  @ApiParam({ name: 'combinationId', description: 'ID of the class combination' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        day: {
          type: 'string',
          example: 'Monday',
          description: 'The day to be deleted from the timetable',
        },
      },
    },
  })
  async deleteDayFromTimetable(
    @Param('combinationId') combinationId: string,
    @Body() dto: { day: string },
  ) {
    return this.classService.deleteDayFromTimetable(combinationId, dto.day);
  }
}
