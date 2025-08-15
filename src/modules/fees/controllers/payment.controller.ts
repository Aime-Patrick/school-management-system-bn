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
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { QueryPaymentsDto } from '../dto/query-fees.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  private transformToResponseDto(payment: any): PaymentResponseDto {
    return {
      _id: payment._id?.toString() || payment.id,
      student: payment.student?._id?.toString() || payment.student?.toString() || payment.student,
      feeAssignment: payment.feeAssignment?._id?.toString() || payment.feeAssignment?.toString() || payment.feeAssignment,
      school: payment.school?._id?.toString() || payment.school?.toString() || payment.school,
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      status: payment.status,
      paymentType: payment.paymentType,
      paymentDate: payment.paymentDate,
      transactionId: payment.transactionId,
      referenceNumber: payment.referenceNumber,
      receiptNumber: payment.receiptNumber,
      notes: payment.notes,
      recordedBy: payment.recordedBy?._id?.toString() || payment.recordedBy?.toString() || payment.recordedBy,
      approvedBy: payment.approvedBy?._id?.toString() || payment.approvedBy?.toString() || payment.approvedBy,
      approvedAt: payment.approvedAt,
      refundAmount: payment.refundAmount || 0,
      refundDate: payment.refundDate,
      refundReason: payment.refundReason,
      refundedBy: payment.refundedBy?._id?.toString() || payment.refundedBy?.toString() || payment.refundedBy,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private transformToResponseDtoArray(payments: any[]): PaymentResponseDto[] {
    return payments.map(payment => this.transformToResponseDto(payment));
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Create a new payment record',
    description: 'Creates a new payment record for a student fee assignment. Only admins and accountants can create payments.',
  })
  @ApiBody({
    type: CreatePaymentDto,
    description: 'Payment creation data',
    examples: {
      cashPayment: {
        summary: 'Cash Payment',
        value: {
          student: '507f1f77bcf86cd799439011',
          feeAssignment: '507f1f77bcf86cd799439012',
          school: '507f1f77bcf86cd799439013',
          amount: 50000,
          paymentMode: 'cash',
          paymentDate: '2024-12-01T10:00:00.000Z',
          recordedBy: '507f1f77bcf86cd799439014',
          notes: 'Payment for first term fees',
        },
      },
      bankTransfer: {
        summary: 'Bank Transfer Payment',
        value: {
          student: '507f1f77bcf86cd799439011',
          feeAssignment: '507f1f77bcf86cd799439012',
          school: '507f1f77bcf86cd799439013',
          amount: 50000,
          paymentMode: 'bank_transfer',
          paymentDate: '2024-12-01T10:00:00.000Z',
          bankName: 'Chase Bank',
          accountNumber: '1234567890',
          referenceNumber: 'REF001',
          recordedBy: '507f1f77bcf86cd799439014',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
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
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.create(createPaymentDto);
    return this.transformToResponseDto(payment);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payments',
    description: 'Retrieves a paginated list of payments with optional filtering and search capabilities.',
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
    name: 'feeAssignment',
    required: false,
    type: String,
    description: 'Filter by fee assignment ID',
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
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    description: 'Filter by payment status',
    example: 'completed',
  })
  @ApiQuery({
    name: 'paymentMode',
    required: false,
    enum: ['cash', 'bank_transfer', 'card', 'mobile_money', 'online_payment', 'cheque'],
    description: 'Filter by payment mode',
    example: 'cash',
  })
  @ApiQuery({
    name: 'paymentDateFrom',
    required: false,
    type: String,
    description: 'Filter by payment date from (ISO date string)',
    example: '2024-12-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'paymentDateTo',
    required: false,
    type: String,
    description: 'Filter by payment date to (ISO date string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'amountFrom',
    required: false,
    type: Number,
    description: 'Filter by amount range from',
    example: 10000,
  })
  @ApiQuery({
    name: 'amountTo',
    required: false,
    type: Number,
    description: 'Filter by amount range to',
    example: 100000,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/PaymentResponseDto' },
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findAll(@Query() query: QueryPaymentsDto) {
    return await this.paymentService.findAll(query);
  }

  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Get payments by student',
    description: 'Retrieves all payments for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid student ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByStudent(@Param('studentId') studentId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentService.findByStudent(studentId);
    return this.transformToResponseDtoArray(payments);
  }

  @Get('fee-assignment/:feeAssignmentId')
  @ApiOperation({
    summary: 'Get payments by fee assignment',
    description: 'Retrieves all payments for a specific fee assignment.',
  })
  @ApiParam({
    name: 'feeAssignmentId',
    description: 'Fee assignment ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee assignment payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid fee assignment ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByFeeAssignment(@Param('feeAssignmentId') feeAssignmentId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentService.findByFeeAssignment(feeAssignmentId);
    return this.transformToResponseDtoArray(payments);
  }

  @Get('summary/:schoolId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Get payment summary for a school',
    description: 'Retrieves a comprehensive payment summary for a specific school. Only admins and accountants can access this endpoint.',
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
    description: 'Start date for summary (ISO date string)',
    example: '2024-12-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for summary (ISO date string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalPayments: { type: 'number', example: 150 },
        totalAmount: { type: 'number', example: 7500000 },
        completedAmount: { type: 'number', example: 7000000 },
        pendingAmount: { type: 'number', example: 500000 },
        failedAmount: { type: 'number', example: 0 },
        refundedAmount: { type: 'number', example: 0 },
        paymentModeBreakdown: { type: 'object' },
        statusBreakdown: { type: 'object' },
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
  async getPaymentSummary(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.paymentService.getPaymentSummary(schoolId, start, end);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a payment by ID',
    description: 'Retrieves a specific payment by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid payment ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.findOne(id);
    return this.transformToResponseDto(payment);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Update a payment',
    description: 'Updates an existing payment. Only admins and accountants can update payments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: CreatePaymentDto,
    description: 'Payment update data (partial)',
    examples: {
      updateAmount: {
        summary: 'Update Payment Amount',
        value: {
          amount: 55000,
          notes: 'Updated amount due to additional charges',
        },
      },
      updateNotes: {
        summary: 'Update Payment Notes',
        value: {
          notes: 'Payment received in two installments',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment updated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or invalid data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
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
    @Body() updatePaymentDto: Partial<CreatePaymentDto>,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.update(id, updatePaymentDto);
    return this.transformToResponseDto(payment);
  }

  @Put(':id/approve')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Approve a payment',
    description: 'Approves a pending payment and changes its status to completed. Only admins and accountants can approve payments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedBy: {
          type: 'string',
          description: 'User ID who is approving the payment',
          example: '507f1f77bcf86cd799439014',
        },
      },
      required: ['approvedBy'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment approved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid payment ID or payment not in pending status',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async approvePayment(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.approvePayment(id, approvedBy);
    return this.transformToResponseDto(payment);
  }

  @Put(':id/reject')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Reject a payment',
    description: 'Rejects a pending payment and changes its status to failed. Only admins and accountants can reject payments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedBy: {
          type: 'string',
          description: 'User ID who is rejecting the payment',
          example: '507f1f77bcf86cd799439014',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejecting the payment',
          example: 'Insufficient funds',
        },
      },
      required: ['approvedBy', 'reason'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment rejected successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid payment ID or payment not in pending status',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async rejectPayment(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
    @Body('reason') reason: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.rejectPayment(id, approvedBy, reason);
    return this.transformToResponseDto(payment);
  }

  @Put(':id/refund')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Process a refund',
    description: 'Processes a refund for a completed payment. Only admins and accountants can process refunds.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refundAmount: {
          type: 'number',
          description: 'Amount to refund',
          example: 50000,
        },
        refundReason: {
          type: 'string',
          description: 'Reason for the refund',
          example: 'Student withdrawal',
        },
        refundedBy: {
          type: 'string',
          description: 'User ID who is processing the refund',
          example: '507f1f77bcf86cd799439014',
        },
        refundNotes: {
          type: 'string',
          description: 'Additional notes about the refund',
          example: 'Refund processed due to student withdrawal',
        },
      },
      required: ['refundAmount', 'refundReason', 'refundedBy'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid payment ID, amount, or payment not completed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async processRefund(
    @Param('id') id: string,
    @Body('refundAmount') refundAmount: number,
    @Body('refundReason') refundReason: string,
    @Body('refundedBy') refundedBy: string,
    @Body('refundNotes') refundNotes?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.processRefund(id, refundAmount, refundReason, refundedBy, refundNotes);
    return this.transformToResponseDto(payment);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete a payment',
    description: 'Deletes a payment. Only admins can delete payments, and only pending payments can be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid payment ID or payment not in pending status',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
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
    return await this.paymentService.remove(id);
  }
}
