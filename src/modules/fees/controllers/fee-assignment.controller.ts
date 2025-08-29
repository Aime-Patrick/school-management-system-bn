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
  Put,
  Req,
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
import { FeeAssignmentService } from '../services/fee-assignment.service';
import { CreateFeeAssignmentDto } from '../dto/create-fee-assignment.dto';
import { QueryFeeAssignmentsDto } from '../dto/query-fees.dto';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';
import { AutoAssignFeesDto } from '../dto/auto-assign-fees.dto';

@ApiTags('Fee Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees/assignments')
export class FeeAssignmentController {
  constructor(private readonly feeAssignmentService: FeeAssignmentService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Create a new fee assignment',
    description:
      'Creates a new fee assignment for a student. Only admins and accountants can create fee assignments.',
  })
  @ApiBody({
    type: CreateFeeAssignmentDto,
    description: 'Fee assignment creation data',
    examples: {
      basicAssignment: {
        summary: 'Basic Fee Assignment',
        value: {
          student: '507f1f77bcf86cd799439011',
          feeStructure: '507f1f77bcf86cd799439012',
          school: '507f1f77bcf86cd799439013',
          assignedAmount: 50000,
          assignedBy: '507f1f77bcf86cd799439014',
        },
      },
      withDiscounts: {
        summary: 'Fee Assignment with Discounts',
        value: {
          student: '507f1f77bcf86cd799439011',
          feeStructure: '507f1f77bcf86cd799439012',
          school: '507f1f77bcf86cd799439013',
          assignedAmount: 50000,
          discountAmount: 5000,
          discountPercentage: 10,
          scholarshipAmount: 10000,
          assignedBy: '507f1f77bcf86cd799439014',
          notes: 'Special consideration for this student',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fee assignment created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or invalid data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async create(@Body() createFeeAssignmentDto: CreateFeeAssignmentDto) {
    return await this.feeAssignmentService.create(createFeeAssignmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all fee assignments',
    description:
      'Retrieves a paginated list of fee assignments with optional filtering and search capabilities.',
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
    name: 'student',
    required: false,
    type: String,
    description: 'Filter by student ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'feeStructure',
    required: false,
    type: String,
    description: 'Filter by fee structure ID',
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
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'completed'],
    description: 'Filter by assignment status',
    example: 'active',
  })
  @ApiQuery({
    name: 'dueDateFrom',
    required: false,
    type: String,
    description: 'Filter by due date from (ISO date string)',
    example: '2024-12-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'dueDateTo',
    required: false,
    type: String,
    description: 'Filter by due date to (ISO date string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee assignments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findAll(@Query() query: QueryFeeAssignmentsDto) {
    return await this.feeAssignmentService.findAll(query);
  }

  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Get fee assignments by student',
    description: 'Retrieves all fee assignments for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student fee assignments retrieved successfully',
    type: 'array',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid student ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByStudent(@Param('studentId') studentId: string) {
    return await this.feeAssignmentService.findByStudent(studentId);
  }

  @Get('school/:schoolId')
  @ApiOperation({
    summary: 'Get fee assignments by school',
    description: 'Retrieves all fee assignments for a specific school.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'School fee assignments retrieved successfully',
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
    return await this.feeAssignmentService.findBySchool(schoolId);
  }

  @Get('outstanding')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Get outstanding fees for a school',
    description:
      'Retrieves a list of outstanding fees for a specific school. Only admins and accountants can access this endpoint.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Outstanding fees retrieved successfully',
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
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async getOutstandingFees(@Req() req) {
    const schoolId = req.user.schoolId;
    return await this.feeAssignmentService.getOutstandingFees(schoolId);
  }

  @Get('debug/outstanding-fees')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Debug outstanding fees aggregation',
    description: 'Debug endpoint to test the aggregation pipeline for outstanding fees',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Debug data returned successfully',
  })
  async debugOutstandingFees(@Req() req) {
    const schoolId = req.user.schoolId;
    return await this.feeAssignmentService.debugOutstandingFees(schoolId);
  }

  @Get('check-assignments')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Check fee assignments count',
    description: 'Check how many fee assignments exist for the school',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment count retrieved successfully',
  })
  async checkFeeAssignments(@Req() req) {
    const schoolId = req.user.schoolId;
    return await this.feeAssignmentService.checkFeeAssignments(schoolId);
  }

  @Post('auto-assign')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Auto-assign fees to students',
    description:
      'Automatically assigns fees to students. Supports both individual student assignment and bulk assignment to multiple students/classes.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        feeStructureId: {
          type: 'string',
          description: 'Fee Structure ID',
          example: '507f1f77bcf86cd799439012',
        },
        // Individual assignment
        studentId: {
          type: 'string',
          description: 'Student ID (for individual assignment)',
          example: '507f1f77bcf86cd799439011',
        },
        // Bulk assignment
        classIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Class IDs (for bulk assignment)',
          example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
        },
        studentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Student IDs (for bulk assignment)',
          example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439015'],
        },
        assignToAllClasses: {
          type: 'boolean',
          description: 'Assign to all classes in the school',
          example: false,
        },
        assignToAllStudents: {
          type: 'boolean',
          description: 'Assign to all students in selected classes',
          example: false,
        },
        dueDate: {
          type: 'string',
          format: 'date',
          description: 'Due date for the fee assignment',
          example: '2024-09-15',
        },
        sendNotification: {
          type: 'boolean',
          description: 'Send notification to students/parents',
          example: true,
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the assignment',
          example: 'Term 1 fees assignment',
        },
      },
      required: ['feeStructureId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fees auto-assigned successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        assignedCount: { type: 'number' },
        assignments: {
          type: 'array',
          items: { $ref: '#/components/schemas/FeeAssignment' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid data or no fee structures found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async autoAssignFees(@Body() autoAssignDto: AutoAssignFeesDto, @Req() req) {
    const schoolId = req.user.schoolId;
    const assignedBy = req.user.id;
    return await this.feeAssignmentService.autoAssignFees(
      autoAssignDto,
      schoolId,
      assignedBy,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a fee assignment by ID',
    description:
      'Retrieves a specific fee assignment by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee assignment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee assignment retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid fee assignment ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee assignment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findOne(@Param('id') id: string) {
    return await this.feeAssignmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Update a fee assignment',
    description:
      'Updates an existing fee assignment. Only admins and accountants can update fee assignments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee assignment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: CreateFeeAssignmentDto,
    description: 'Fee assignment update data (partial)',
    examples: {
      updateDiscounts: {
        summary: 'Update Discounts',
        value: {
          discountAmount: 10000,
          discountPercentage: 15,
          notes: 'Updated discount due to special circumstances',
        },
      },
      updateScholarship: {
        summary: 'Update Scholarship',
        value: {
          scholarshipAmount: 20000,
          scholarshipType: 'Merit-based',
          scholarshipReason: 'Outstanding academic performance',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee assignment updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or invalid data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee assignment not found',
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
    @Body() updateFeeAssignmentDto: Partial<CreateFeeAssignmentDto>,
  ) {
    return await this.feeAssignmentService.update(id, updateFeeAssignmentDto);
  }

  @Put(':id/complete')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Mark fee assignment as completed',
    description:
      'Marks a fee assignment as completed. Only admins and accountants can complete fee assignments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee assignment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee assignment marked as completed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Bad request - invalid fee assignment ID or assignment not active',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee assignment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async markAsCompleted(@Param('id') id: string) {
    return await this.feeAssignmentService.markAsCompleted(id);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete a fee assignment',
    description:
      'Deletes a fee assignment. Only admins can delete fee assignments, and only active assignments can be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee assignment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee assignment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Bad request - invalid fee assignment ID or assignment not active',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee assignment not found',
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
    return await this.feeAssignmentService.remove(id);
  }

}
