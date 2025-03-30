import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';

@ApiTags('results')
@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Create a new result',
    description: 'Allows school admins and teachers to create a new result.',
  })
  async create(@Body() createResultDto: CreateResultDto) {
    return this.resultService.createResult(createResultDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get all results',
    description: 'Retrieve all results with optional filters for class and exam type.',
  })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'Filter results by class ID' })
  @ApiQuery({ name: 'examType',enum: ['Midterm', 'Final', 'Assessment'], required: false, type: String, description: 'Filter results by exam type' })
  async findAll(
    @Query('classId') classId?: string,
    @Query('examType') examType?: string,
  ) {
    return this.resultService.findAll(classId, examType);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get a result by ID',
    description: 'Retrieve details of a specific result by its ID.',
  })
  async findOne(@Param('id') id: string) {
    return this.resultService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Update a result',
    description: 'Allows school admins and teachers to update an existing result by its ID.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
  ) {
    return this.resultService.update(id, updateResultDto);
  }
}
