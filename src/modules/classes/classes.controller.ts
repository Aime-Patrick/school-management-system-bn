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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/schemas/user.schema';
import { ClassService } from './classes.service';
import { CreateCombinationDto } from './dto/create-class-combination.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { StudentIdsDto } from './dto/student-ids.dto';
import { CreateClassDto } from './dto/create-class.dto';

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

  @Put(':classId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Update class details',
    description: 'Update the details of a specific class by its ID.',
  })
  async updateClass(
    @Param('classId') classId: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    try {
      return this.classService.updateClass(classId, updateClassDto);
    } catch (error) {
      throw error;
    }
  }

  @Post(':classId/students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Add students to a class',
    description: 'Add students to a specific class by their IDs.',
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
  async addStudentsToClass(
    @Param('classId') classId: string,
    @Body() dto: StudentIdsDto,
    @Req() req,
  ): Promise<any> {
    const userId = req.user.id;
    return this.classService.addStudentsToClass(classId, dto.studentIds, userId);
  }

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
}
