import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { SchoolService } from '../school/school.service';
import { HashService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { StudentsService } from '../students/students.service';

@ApiTags('system-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-admin')
export class SystemAdminController {
  constructor(
    private readonly schoolService: SchoolService,
    private hashService: HashService,
    private readonly studentsService: StudentsService
  ) {}

  @Get('all-schools')
  @ApiBearerAuth()
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get all schools',
    description: 'Retrieve all schools.',
  })
  async findAllSchools() {
    try {
      return await this.schoolService.findAllSchools();
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  }

  @Get('all-students')
    @ApiBearerAuth()
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({ summary: 'Get All student', description: 'Retrieve all students in system' })
    async getAllStudent() {
        try {
            return await this.studentsService.getAllStudent();
        } catch (error) {
            throw error;
        }
    }

  @Get(':schoolId')
      @ApiBearerAuth()
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
}
