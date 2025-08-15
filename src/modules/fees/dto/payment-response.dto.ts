import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode, PaymentStatus, PaymentType } from '../../../schemas/fee-payment.schema';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the payment',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Student ID',
    example: '507f1f77bcf86cd799439011',
  })
  student: string;

  @ApiProperty({
    description: 'Fee assignment ID',
    example: '507f1f77bcf86cd799439012',
  })
  feeAssignment: string;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439013',
  })
  school: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment mode',
    enum: PaymentMode,
    example: PaymentMode.CASH,
  })
  paymentMode: PaymentMode;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment type',
    enum: PaymentType,
    example: PaymentType.FULL,
  })
  paymentType: PaymentType;

  @ApiProperty({
    description: 'Payment date',
    example: '2024-12-01T10:00:00.000Z',
  })
  paymentDate: Date;

  @ApiProperty({
    description: 'Transaction ID from payment gateway',
    example: 'txn_123456789',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Reference number for the payment',
    example: 'REF001',
  })
  referenceNumber: string;

  @ApiProperty({
    description: 'Receipt number',
    example: 'RCPT001',
  })
  receiptNumber: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Payment for first term fees',
  })
  notes: string;

  @ApiProperty({
    description: 'User ID who recorded the payment',
    example: '507f1f77bcf86cd799439014',
  })
  recordedBy: string;

  @ApiProperty({
    description: 'User ID who approved the payment',
    example: '507f1f77bcf86cd799439015',
  })
  approvedBy: string;

  @ApiProperty({
    description: 'Approval timestamp',
    example: '2024-12-01T10:30:00.000Z',
  })
  approvedAt: Date;

  @ApiProperty({
    description: 'Refund amount',
    example: 0,
  })
  refundAmount: number;

  @ApiProperty({
    description: 'Refund date',
    example: null,
  })
  refundDate: Date;

  @ApiProperty({
    description: 'Refund reason',
    example: null,
  })
  refundReason: string;

  @ApiProperty({
    description: 'User ID who processed the refund',
    example: null,
  })
  refundedBy: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-01T10:00:00.000Z',
  })
  updatedAt: Date;
}
