import { Controller, Post, Body, Req, UseGuards, Get, Param, Put, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UserRole } from 'src/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}

  @Post('add-teacher')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiConsumes('multipart/form-data')
      @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiOperation({ summary: 'Add teacher to the school', description: 'Add a new teacher record.' })
  async createTeacher(@Req() req, @Body() teacherDto: CreateTeacherDto, @UploadedFile() file: Express.Multer.File) {
    return this.teacherService.createTeacher(teacherDto, req.user.id, file);
  }

  @Get('school/:schoolId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get teachers by school', description: 'Retrieve all teachers for a specific school.' })
  async getTeachersBySchool(@Param('schoolId') schoolId: string) {
    return this.teacherService.getTeachersBySchool(schoolId);
  }

  @Get(':teacherId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get teacher by ID', description: 'Retrieve a teacher by their ID.' })
  async getTeacherById(@Param('teacherId') teacherId: string) {
    const teacher = await this.teacherService.findTeacher(teacherId);
    if (!teacher) {
      throw new BadRequestException(`Teacher with ID ${teacherId} not found.`);
    }
    return teacher;
  }

  @Put(':teacherId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update teacher', description: 'Update a teacher record by their ID.' })
  async updateTeacher(@Param('teacherId') teacherId: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.updateTeacher(teacherId, updateTeacherDto);
  }

  @Delete(':teacherId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Delete teacher', description: 'Delete a teacher record by their ID.' })
  async deleteTeacher(@Param('teacherId') teacherId: string) {
    return this.teacherService.deleteTeacher(teacherId);
  }
}
