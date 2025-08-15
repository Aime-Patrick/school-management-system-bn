import {
  Controller,
  Get,
  Param,
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
} from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';

@ApiTags('Fee Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('outstanding/:schoolId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Get outstanding fees report',
    description: 'Generates a comprehensive report of outstanding fees for a school. Only admins and accountants can access this endpoint.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: String,
    description: 'Filter by class ID',
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
    description: 'Outstanding fees report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalStudents: { type: 'number', example: 150 },
        totalOutstandingAmount: { type: 'number', example: 7500000 },
        averageOutstandingAmount: { type: 'number', example: 50000 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              studentName: { type: 'string', example: 'John Doe' },
              registrationNumber: { type: 'string', example: 'STU001' },
              className: { type: 'string', example: 'Class 10A' },
              feeCategory: { type: 'string', example: 'Tuition Fee' },
              assignedAmount: { type: 'number', example: 50000 },
              totalPaid: { type: 'number', example: 20000 },
              outstandingAmount: { type: 'number', example: 30000 },
              dueDate: { type: 'string', example: '2024-12-31T00:00:00.000Z' },
              daysOverdue: { type: 'number', example: 15 },
            },
          },
        },
      },
    },
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
  async getOutstandingFeesReport(
    @Param('schoolId') schoolId: string,
    @Query('classId') classId?: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: string,
  ) {
    return await this.reportsService.getOutstandingFeesReport(schoolId, classId, academicYear, term);
  }

  @Get('summary/:schoolId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Get payment summary report',
    description: 'Generates a comprehensive payment summary report for a school. Only admins and accountants can access this endpoint.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for report (ISO date string)',
    example: '2024-12-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for report (ISO date string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment summary report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalPayments: { type: 'number', example: 500 },
        totalAmount: { type: 'number', example: 25000000 },
        completedAmount: { type: 'number', example: 23000000 },
        pendingAmount: { type: 'number', example: 1500000 },
        failedAmount: { type: 'number', example: 500000 },
        refundedAmount: { type: 'number', example: 0 },
        paymentModeBreakdown: { type: 'object' },
        statusBreakdown: { type: 'object' },
        dailyBreakdown: { type: 'object' },
        monthlyBreakdown: { type: 'object' },
      },
    },
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
  async getPaymentSummaryReport(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.reportsService.getPaymentSummaryReport(schoolId, start, end);
  }

  @Get('defaulters/:schoolId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Get defaulter list report',
    description: 'Generates a list of students who have defaulted on their fee payments. Only admins and accountants can access this endpoint.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'daysOverdue',
    required: false,
    type: Number,
    description: 'Minimum days overdue to be considered a defaulter (default: 30)',
    example: 30,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Defaulter list report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalDefaulters: { type: 'number', example: 25 },
        totalOutstandingAmount: { type: 'number', example: 1250000 },
        averageDaysOverdue: { type: 'number', example: 45 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              studentName: { type: 'string', example: 'John Doe' },
              registrationNumber: { type: 'string', example: 'STU001' },
              phoneNumber: { type: 'string', example: '+1234567890' },
              className: { type: 'string', example: 'Class 10A' },
              feeCategory: { type: 'string', example: 'Tuition Fee' },
              assignedAmount: { type: 'number', example: 50000 },
              totalPaid: { type: 'number', example: 10000 },
              outstandingAmount: { type: 'number', example: 40000 },
              dueDate: { type: 'string', example: '2024-11-15T00:00:00.000Z' },
              daysOverdue: { type: 'number', example: 45 },
            },
          },
        },
      },
    },
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
  async getDefaulterList(
    @Param('schoolId') schoolId: string,
    @Query('daysOverdue') daysOverdue: number = 30,
  ) {
    return await this.reportsService.getDefaulterList(schoolId, daysOverdue);
  }

  @Get('student/:studentId/history')
  @ApiOperation({
    summary: 'Get student payment history',
    description: 'Generates a comprehensive payment history report for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student payment history generated successfully',
    schema: {
      type: 'object',
      properties: {
        student: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            registrationNumber: { type: 'string', example: 'STU001' },
            className: { type: 'string', example: 'Class 10A' },
          },
        },
        summary: {
          type: 'object',
          properties: {
            totalAssignments: { type: 'number', example: 5 },
            totalAssignedAmount: { type: 'number', example: 250000 },
            totalPaidAmount: { type: 'number', example: 200000 },
            totalOutstandingAmount: { type: 'number', example: 50000 },
          },
        },
        paymentHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              feeCategory: { type: 'string', example: 'Tuition Fee' },
              className: { type: 'string', example: 'Class 10A' },
              academicYear: { type: 'string', example: '2024-2025' },
              term: { type: 'string', example: 'First Term' },
              assignedAmount: { type: 'number', example: 50000 },
              totalPaid: { type: 'number', example: 40000 },
              outstandingAmount: { type: 'number', example: 10000 },
              paymentStatus: { type: 'string', example: 'Outstanding' },
              dueDate: { type: 'string', example: '2024-12-31T00:00:00.000Z' },
              payments: { type: 'array' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid student ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getStudentPaymentHistory(@Param('studentId') studentId: string) {
    return await this.reportsService.getStudentPaymentHistory(studentId);
  }

  @Get('collection/:schoolId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Get fee collection report',
    description: 'Generates a fee collection report grouped by time period. Only admins and accountants can access this endpoint.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for report (ISO date string)',
    example: '2024-12-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for report (ISO date string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    enum: ['day', 'week', 'month'],
    description: 'Grouping period for the report (default: month)',
    example: 'month',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee collection report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalPeriods: { type: 'number', example: 12 },
        totalAmount: { type: 'number', example: 25000000 },
        averageAmountPerPeriod: { type: 'number', example: 2083333 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              period: { type: 'string', example: '2024-12' },
              totalPayments: { type: 'number', example: 150 },
              totalAmount: { type: 'number', example: 7500000 },
              paymentModeBreakdown: { type: 'object' },
            },
          },
        },
      },
    },
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
  async getFeeCollectionReport(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'month',
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.reportsService.getFeeCollectionReport(schoolId, start, end, groupBy);
  }
}
