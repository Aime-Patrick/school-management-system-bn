import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { FeeStructureService } from '../services/fee-structure.service';
import { CreateFeeStructureDto } from '../dto/create-fee-structure.dto';
import { QueryFeeStructuresDto } from '../dto/query-fees.dto';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';

@ApiTags('Fee Structures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees/structures')
export class FeeStructureController {
  constructor(private readonly feeStructureService: FeeStructureService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Create a new fee structure',
    description: 'Creates a new fee structure with the specified details. Only admins and accountants can create fee structures.',
  })
  @ApiBody({
    type: CreateFeeStructureDto,
    description: 'Fee structure creation data',
    examples: {
      tuitionStructure: {
        summary: 'Tuition Fee Structure',
        value: {
          feeCategory: '507f1f77bcf86cd799439011',
          class: '507f1f77bcf86cd799439012',
          school: '507f1f77bcf86cd799439013',
          amount: 50000,
          academicYear: '2024-2025',
          term: 'First Term',
          dueDate: '2024-12-31T23:59:59.000Z',
          lateFeeAmount: 1000,
          lateFeePercentage: 5,
        },
      },
      transportStructure: {
        summary: 'Transport Fee Structure',
        value: {
          feeCategory: '507f1f77bcf86cd799439014',
          class: '507f1f77bcf86cd799439012',
          school: '507f1f77bcf86cd799439013',
          amount: 15000,
          academicYear: '2024-2025',
          term: 'First Term',
          dueDate: '2024-12-31T23:59:59.000Z',
          lateFeeAmount: 500,
          lateFeePercentage: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fee structure created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or duplicate structure',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async create(@Body() createFeeStructureDto: CreateFeeStructureDto) {
    return await this.feeStructureService.create(createFeeStructureDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all fee structures',
    description: 'Retrieves a paginated list of fee structures with optional filtering and search capabilities.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'feeCategory',
    required: false,
    type: String,
    description: 'Filter by fee category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'class',
    required: false,
    type: String,
    description: 'Filter by class ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439013',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    type: String,
    description: 'Filter by academic year',
    example: '2024-2025',
  })
  @ApiQuery({
    name: 'term',
    required: false,
    type: String,
    description: 'Filter by term',
    example: 'First Term',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee structures retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findAll(@Query() query: QueryFeeStructuresDto) {
    return await this.feeStructureService.findAll(query);
  }

  @Get('class/:classId')
  @ApiOperation({
    summary: 'Get fee structures by class',
    description: 'Retrieves all fee structures for a specific class.',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    type: String,
    description: 'Filter by academic year',
    example: '2024-2025',
  })
  @ApiQuery({
    name: 'term',
    required: false,
    type: String,
    description: 'Filter by term',
    example: 'First Term',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee structures retrieved successfully',
    type: 'array',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid class ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByClass(
    @Param('classId') classId: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: string,
  ) {
    return await this.feeStructureService.findByClassAndYear(classId, academicYear || '', term || '');
  }

  @Get('school/:schoolId')
  @ApiOperation({
    summary: 'Get fee structures by school',
    description: 'Retrieves all fee structures for a specific school.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee structures retrieved successfully',
    type: 'array',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid school ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findBySchool(@Param('schoolId') schoolId: string) {
    return await this.feeStructureService.findBySchool(schoolId);
  }

  @Get('calculate/:classId')
  @ApiOperation({
    summary: 'Calculate total fees for a class',
    description: 'Calculates the total fees for a specific class, academic year, and term.',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'academicYear',
    required: true,
    type: String,
    description: 'Academic year',
    example: '2024-2025',
  })
  @ApiQuery({
    name: 'term',
    required: false,
    type: String,
    description: 'Term or semester',
    example: 'First Term',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total fees calculated successfully',
    schema: {
      type: 'object',
      properties: {
        totalAmount: { type: 'number', example: 150000 },
        message: { type: 'string', example: 'Total fees calculated successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid class ID or academic year',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async calculateTotalFees(
    @Param('classId') classId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term?: string,
  ) {
    const totalAmount = await this.feeStructureService.calculateTotalFees(classId, academicYear, term);
    return {
      totalAmount,
      message: 'Total fees calculated successfully',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a fee structure by ID',
    description: 'Retrieves a specific fee structure by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee structure ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee structure retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid fee structure ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee structure not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findOne(@Param('id') id: string) {
    return await this.feeStructureService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Update a fee structure',
    description: 'Updates an existing fee structure. Only admins and accountants can update fee structures.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee structure ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: CreateFeeStructureDto,
    description: 'Fee structure update data (partial)',
    examples: {
      updateAmount: {
        summary: 'Update Fee Amount',
        value: {
          amount: 55000,
          lateFeeAmount: 1500,
        },
      },
      updateDueDate: {
        summary: 'Update Due Date',
        value: {
          dueDate: '2025-01-15T23:59:59.000Z',
          gracePeriodDays: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee structure updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or duplicate structure',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee structure not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFeeStructureDto: Partial<CreateFeeStructureDto>,
  ) {
    return await this.feeStructureService.update(id, updateFeeStructureDto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete a fee structure',
    description: 'Deletes a fee structure. Only admins can delete fee structures.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee structure ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee structure deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid fee structure ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee structure not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.feeStructureService.remove(id);
  }
}
