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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/schemas/user.schema';
import { ClassService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new class', description: 'Create a new class record.' })
  async createClass(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get all classes',
    description: 'Retrieve all classes with optional filters for grade, subject, or teacher.',
  })
  async getAllClasses(
    @Query('grade') grade?: string,
    @Query('subject') subject?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.classService.getAllClasses(grade, subject, teacherId);
  }

  @Get(':classId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get class details',
    description: 'Retrieve details of a specific class by its ID.',
  })
  async getClassById(@Param('classId') classId: string) {
    return this.classService.getClassById(classId);
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
    return this.classService.updateClass(classId, updateClassDto);
  }

  @Post(':classId/students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Add students to a class',
    description: 'Add students to a specific class by their IDs.',
  })
  async addStudentsToClass(
    @Param('classId') classId: string,
    @Body('studentIds') studentIds: string[],
  ) {
    return this.classService.addStudentsToClass(classId, studentIds);
  }

  @Delete(':classId/students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Remove students from a class',
    description: 'Remove students from a specific class by their IDs.',
  })
  async removeStudentsFromClass(
    @Param('classId') classId: string,
    @Body('studentIds') studentIds: string[],
  ) {
    return this.classService.removeStudentsFromClass(classId, studentIds);
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
    return this.classService.getClassPerformance(classId);
  }
}
