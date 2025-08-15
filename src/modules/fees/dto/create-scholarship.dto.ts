import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ScholarshipType, DiscountType } from '../../../schemas/scholarship.schema';

export class CreateScholarshipDto {
  @ApiProperty({
    description: 'Name of the scholarship',
    example: 'Merit Scholarship 2024',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the scholarship',
    example: 'Scholarship for students with outstanding academic performance',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of scholarship',
    enum: ScholarshipType,
    example: ScholarshipType.MERIT_BASED,
  })
  @IsEnum(ScholarshipType)
  type: ScholarshipType;

  @ApiProperty({
    description: 'Type of discount',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 25,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({
    description: 'School ID where this scholarship applies',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  school: string;

  @ApiProperty({
    description: 'Class ID where this scholarship applies',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  applicableClass?: string;

  @ApiProperty({
    description: 'Fee category ID where this scholarship applies',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  applicableFeeCategory?: string;

  @ApiProperty({
    description: 'Valid from date',
    example: '2024-09-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiProperty({
    description: 'Valid until date',
    example: '2025-06-30T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiProperty({
    description: 'Whether the scholarship is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Maximum discount amount allowed',
    example: 50000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({
    description: 'Minimum amount required to be eligible',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmountRequired?: number;

  @ApiProperty({
    description: 'Eligibility criteria',
    example: 'Must maintain GPA above 3.5',
    required: false,
  })
  @IsOptional()
  @IsString()
  eligibilityCriteria?: string;

  @ApiProperty({
    description: 'Required documents for application',
    example: ['Transcript', 'Recommendation Letter'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredDocuments?: string[];

  @ApiProperty({
    description: 'User ID who created the scholarship',
    example: '507f1f77bcf86cd799439014',
  })
  @IsString()
  createdBy: string;
}
