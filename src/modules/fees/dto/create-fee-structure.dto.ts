import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateFeeStructureDto {
  @ApiProperty({
    description: 'Fee category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  feeCategory: string;

  @ApiProperty({
    description: 'Class ID where this fee structure applies',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  class: string;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  school: string;

  @ApiProperty({
    description: 'Fee amount',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  @IsString()
  academicYear: string;

  @ApiProperty({
    description: 'Term or semester',
    example: 'First Term',
  })
  @IsString()
  term: string;

  @ApiProperty({
    description: 'Discount amount',
    example: 5000,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({
    description: 'Discount percentage',
    example: 10,
    default: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({
    description: 'Whether the fee structure is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Due date for payment',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Late fee amount',
    example: 1000,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @ApiProperty({
    description: 'Late fee percentage',
    example: 5,
    default: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lateFeePercentage?: number;

  @ApiProperty({
    description: 'Grace period in days',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gracePeriodDays?: number;
}
