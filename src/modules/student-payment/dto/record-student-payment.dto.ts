import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber, IsArray, IsDate, IsMongoId, IsOptional } from 'class-validator';
import { paymentStatus, paymentMethod } from '../../../schemas/student-payment';
import { Type } from 'class-transformer';

export class CreateStudentPaymentDto {

  @ApiProperty({ example: '60d0fe4f5311236168a109cb', description: 'The ID of the student' })
  @IsMongoId()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 50000, description: 'The amount of school fees' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  schoolFees: number;

  @ApiProperty({ example: 'unpaid', enum: paymentStatus, description: 'The payment status' })
  @IsEnum(paymentStatus)
  @IsNotEmpty()
  status: paymentStatus;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Proof of payment (e.g., receipts)',
  })
  @IsOptional()
  proof: any;

  @ApiProperty({ example: '2025-04-01', description: 'The date of payment' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '60d0fe4f5311236168a109cc', description: 'The ID of the term' })
  @IsMongoId()
  @IsNotEmpty()
  termId: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109cd', description: 'The ID of the academic year' })
  @IsMongoId()
  @IsNotEmpty()
  academicId: string;

  @ApiProperty({ example: paymentMethod.CASH, enum: paymentMethod, description: 'The payment method' })
  @IsEnum(paymentMethod)
  @IsNotEmpty()
  paymentMethod: paymentMethod;
}