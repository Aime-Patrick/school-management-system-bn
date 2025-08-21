import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FeeFrequency } from '../../../schemas/fee-category.schema';
import { AssignmentStatus } from '../../../schemas/fee-assignment.schema';
import { PaymentStatus, PaymentMode } from '../../../schemas/fee-payment.schema';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}

export class QueryFeeCategoriesDto extends PaginationDto {
  @ApiProperty({
    description: 'Search by fee category name',
    example: 'tuition',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filter by payment frequency',
    enum: FeeFrequency,
    required: false,
  })
  @IsOptional()
  @IsEnum(FeeFrequency)
  frequency?: FeeFrequency;

  @ApiProperty({
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}

export class QueryFeeStructuresDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by fee category ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by class ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    description: 'Filter by academic year ID',
    example: '6811eb8c7299d79a4c14de08',
    required: false,
  })
  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ApiProperty({
    description: 'Filter by term ID',
    example: '681217c9cebe33b828ee5638',
    required: false,
  })
  @IsOptional()
  @IsString()
  termId?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['active', 'inactive', 'suspended'],
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Filter by active status (legacy, use status instead)',
    example: true,
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  // Legacy field names for backward compatibility
  @ApiProperty({
    description: 'Filter by fee category ID (legacy, use categoryId instead)',
    example: '507f1f77bcf86cd799439011',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  feeCategory?: string;

  @ApiProperty({
    description: 'Filter by class ID (legacy, use classId instead)',
    example: '507f1f77bcf86cd799439012',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiProperty({
    description: 'Filter by academic year (legacy, use academicYearId instead)',
    example: '2024-2025',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({
    description: 'Filter by term (legacy, use termId instead)',
    example: 'First Term',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  term?: string;
}

export class QueryFeeAssignmentsDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by student ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  student?: string;

  @ApiProperty({
    description: 'Filter by fee structure ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  feeStructure?: string;

  @ApiProperty({
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    description: 'Filter by assignment status',
    enum: AssignmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiProperty({
    description: 'Filter by due date from',
    example: '2024-12-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiProperty({
    description: 'Filter by due date to',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;
}

export class QueryPaymentsDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by student ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  student?: string;

  @ApiProperty({
    description: 'Filter by fee assignment ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  feeAssignment?: string;

  @ApiProperty({
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    description: 'Filter by payment status',
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'Filter by payment mode',
    enum: PaymentMode,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @ApiProperty({
    description: 'Filter by payment date from',
    example: '2024-12-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  paymentDateFrom?: string;

  @ApiProperty({
    description: 'Filter by payment date to',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  paymentDateTo?: string;

  @ApiProperty({
    description: 'Filter by amount range from',
    example: 10000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  amountFrom?: number;

  @ApiProperty({
    description: 'Filter by amount range to',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  amountTo?: number;
}
