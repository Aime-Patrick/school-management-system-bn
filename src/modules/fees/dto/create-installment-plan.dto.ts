import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min, IsEnum } from 'class-validator';
import { InstallmentStatus } from '../../../schemas/installment-plan.schema';

export class CreateInstallmentPlanDto {
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
    description: 'Total amount to be paid',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    description: 'Number of installments',
    example: 4,
    minimum: 2,
  })
  @IsNumber()
  @Min(2)
  numberOfInstallments: number;

  @ApiProperty({
    description: 'Amount per installment',
    example: 25000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  installmentAmount: number;

  @ApiProperty({
    description: 'Start date of the installment plan',
    example: '2024-09-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the installment plan',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Status of the installment plan',
    enum: InstallmentStatus,
    example: InstallmentStatus.ACTIVE,
    default: InstallmentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus;

  @ApiProperty({
    description: 'Late fee amount',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Installment plan for first term fees',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'User ID who created the installment plan',
    example: '507f1f77bcf86cd799439014',
  })
  @IsString()
  createdBy: string;
}
