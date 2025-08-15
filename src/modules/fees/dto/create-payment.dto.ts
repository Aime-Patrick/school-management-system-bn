import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, IsArray } from 'class-validator';
import { PaymentMode, PaymentStatus, PaymentType } from '../../../schemas/fee-payment.schema';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Student ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  student: string;

  @ApiProperty({
    description: 'Fee assignment ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  feeAssignment: string;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  school: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Payment mode',
    enum: PaymentMode,
    example: PaymentMode.CASH,
  })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'Payment type',
    enum: PaymentType,
    example: PaymentType.FULL,
    default: PaymentType.FULL,
  })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiProperty({
    description: 'Payment date',
    example: '2024-12-01T10:00:00.000Z',
  })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({
    description: 'Transaction ID from payment gateway',
    example: 'txn_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    description: 'Reference number for the payment',
    example: 'REF001',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({
    description: 'Bank name for bank transfer',
    example: 'Chase Bank',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({
    description: 'Account number for bank transfer',
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({
    description: 'Cheque number for cheque payment',
    example: 'CHK001',
    required: false,
  })
  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @ApiProperty({
    description: 'Last 4 digits of card',
    example: '1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardLastDigits?: string;

  @ApiProperty({
    description: 'Card type',
    example: 'Visa',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiProperty({
    description: 'Mobile money provider',
    example: 'M-Pesa',
    required: false,
  })
  @IsOptional()
  @IsString()
  mobileMoneyProvider?: string;

  @ApiProperty({
    description: 'Online payment gateway',
    example: 'Stripe',
    required: false,
  })
  @IsOptional()
  @IsString()
  onlineGateway?: string;

  @ApiProperty({
    description: 'Gateway transaction ID',
    example: 'gtw_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @ApiProperty({
    description: 'Receipt number',
    example: 'RCPT001',
    required: false,
  })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Payment for first term fees',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'User ID who recorded the payment',
    example: '507f1f77bcf86cd799439014',
  })
  @IsString()
  recordedBy: string;
}
