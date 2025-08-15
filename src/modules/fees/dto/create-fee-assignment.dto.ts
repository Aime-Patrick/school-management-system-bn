import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { AssignmentStatus } from '../../../schemas/fee-assignment.schema';

export class CreateFeeAssignmentDto {
  @ApiProperty({
    description: 'Student ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  student: string;

  @ApiProperty({
    description: 'Fee structure ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  feeStructure: string;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  school: string;

  @ApiProperty({
    description: 'Assignment status',
    enum: AssignmentStatus,
    example: AssignmentStatus.ACTIVE,
    default: AssignmentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiProperty({
    description: 'Assigned fee amount',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  assignedAmount: number;

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
    description: 'Scholarship amount',
    example: 10000,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  scholarshipAmount?: number;

  @ApiProperty({
    description: 'Type of scholarship',
    example: 'Merit-based',
    required: false,
  })
  @IsOptional()
  @IsString()
  scholarshipType?: string;

  @ApiProperty({
    description: 'Reason for scholarship',
    example: 'Academic excellence',
    required: false,
  })
  @IsOptional()
  @IsString()
  scholarshipReason?: string;

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
    description: 'Additional notes',
    example: 'Special consideration for this student',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'User ID who assigned the fee',
    example: '507f1f77bcf86cd799439014',
  })
  @IsString()
  assignedBy: string;
}
