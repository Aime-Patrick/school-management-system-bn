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
  Req,
  BadRequestException,
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
    description: 'Fee structure creation data (school ID is automatically derived from authenticated user)',
    examples: {
      tuitionStructure: {
        summary: 'Tuition Fee Structure',
        value: {
          categoryId: '68a65d72955e62c78b5c5955',
          classId: '6859ecff3c8c7943bbaadd15',
          amount: 100,
          academicYearId: '6811eb8c7299d79a4c14de08',
          termId: '681217c9cebe33b828ee5638',
          dueDate: '2025-08-20T22:00:00.000Z',
          status: 'active',
          lateFeeRules: {
            gracePeriod: 10,
            lateFeeAmount: 10,
            lateFeePercentage: 5
          },
        },
      },
      transportStructure: {
        summary: 'Transport Fee Structure',
        value: {
          categoryId: '68a65d72955e62c78b5c5956',
          classId: '6859ecff3c8c7943bbaadd15',
          amount: 50,
          academicYearId: '6811eb8c7299d79a4c14de08',
          termId: '681217c9cebe33b828ee5638',
          dueDate: '2025-08-20T22:00:00.000Z',
          status: 'active',
          lateFeeRules: {
            gracePeriod: 5,
            lateFeeAmount: 5,
            lateFeePercentage: 3
          },
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
  async create(@Body() createFeeStructureDto: CreateFeeStructureDto, @Req() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found in user context');
    }
    return await this.feeStructureService.create(createFeeStructureDto, schoolId);
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
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by fee category ID',
    example: '68a65d72955e62c78b5c5955',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: String,
    description: 'Filter by class ID',
    example: '6859ecff3c8c7943bbaadd15',
  })
  @ApiQuery({
    name: 'academicYearId',
    required: false,
    type: String,
    description: 'Filter by academic year ID',
    example: '6811eb8c7299d79a4c14de08',
  })
  @ApiQuery({
    name: 'termId',
    required: false,
    type: String,
    description: 'Filter by term ID',
    example: '681217c9cebe33b828ee5638',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status (legacy, use status instead)',
    example: true,
    deprecated: true,
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
  async findAll(@Query() query: QueryFeeStructuresDto, @Req() req) {
    // If no school is specified in query, use the authenticated user's school
    const schoolId = req.user.schoolId;
    return await this.feeStructureService.findAll(query, schoolId);
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
    name: 'academicYearId',
    required: false,
    type: String,
    description: 'Filter by academic year ID',
    example: '6811eb8c7299d79a4c14de08',
  })
  @ApiQuery({
    name: 'termId',
    required: false,
    type: String,
    description: 'Filter by term ID',
    example: '681217c9cebe33b828ee5638',
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
    @Query('academicYearId') academicYearId?: string,
    @Query('termId') termId?: string,
  ) {
    return await this.feeStructureService.findByClassAndYear(classId, academicYearId || '', termId || '');
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
    name: 'academicYearId',
    required: true,
    type: String,
    description: 'Academic year ID',
    example: '6811eb8c7299d79a4c14de08',
  })
  @ApiQuery({
    name: 'termId',
    required: false,
    type: String,
    description: 'Term or semester ID',
    example: '681217c9cebe33b828ee5638',
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
    @Query('academicYearId') academicYearId: string,
    @Query('termId') termId?: string,
  ) {
    const totalAmount = await this.feeStructureService.calculateTotalFees(classId, academicYearId, termId);
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
          amount: 150,
          lateFeeRules: {
            gracePeriod: 15,
            lateFeeAmount: 15,
            lateFeePercentage: 7
          },
        },
      },
      updateDueDate: {
        summary: 'Update Due Date',
        value: {
          dueDate: '2025-01-15T23:59:59.000Z',
          status: 'inactive',
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
    @Req() req,
  ) {
    const schoolId = req.user.schoolId;
    return await this.feeStructureService.update(id, updateFeeStructureDto, schoolId);
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
