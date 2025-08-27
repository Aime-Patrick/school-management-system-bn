import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AcademicService } from './academic.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { CreateAcademicDto } from './dto/create-academic.dto';
import { UpdateAcademicDto } from './dto/update-academic.dto';
@Controller('academic')
@ApiTags('Academic Year')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Get all academic years',
    description: 'Retrieve all academic year records.',
  })
  @ApiResponse({ status: 200, description: 'List of academic years' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 404, description: 'No academic years found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAcademicYears(@Req() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID is required');
    }
    return this.academicService.getAllAcademicYears(schoolId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Create a new academic year',
    description: 'Create a new academic year record.',
  })
  createAcademicYear(@Body() academic: CreateAcademicDto,  @Req() req) {
    const schooldId = req.user.schoolId;
    if (!schooldId) {
      throw new BadRequestException('School ID is required');
    }
    console.log(academic)
    return this.academicService.createAcademicYear(academic, schooldId);
  }

  @Post(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Update an academic year',
    description: 'Update an existing academic year record.',
  })
  updateAcademicYear(
    @Body() academic: CreateAcademicDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID is required');
    }
    return this.academicService.updateAcademicYear(id, academic, schoolId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Update an academic year by ID',
    description: 'Updated a specific academic year record by ID.',
  })
    @ApiResponse({ status: 200, description: 'Academic year updated successfully' })
    @ApiResponse({ status: 404, description: 'Academic year not found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
  updateAcademicYearById(
    @Param('id') id: string,
    @Body() academic: UpdateAcademicDto,
    @Req() req,
  ) {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID is required');
    }
    return this.academicService.updateAcademicYear(id, academic, schoolId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete an academic year',
    description: 'Delete an existing academic year record.',
  })
  deleteAcademicYear(@Param('id') id: string, @Req() req) {
    const schooldId = req.user.schoolId;
    if (!schooldId) {
      throw new BadRequestException('School ID is required');
    }
    return this.academicService.deleteAcademicYear(id, schooldId.toString());
  }
}
