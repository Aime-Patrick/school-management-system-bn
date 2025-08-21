import { ApiProperty } from '@nestjs/swagger';
import { FeeStatus, LateFeeRulesDto } from './create-fee-structure.dto';

export class FeeStructureResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the fee structure',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Fee category ID',
    example: '507f1f77bcf86cd799439011',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Class ID where this fee structure applies',
    example: '507f1f77bcf86cd799439012',
  })
  classId: string;

  @ApiProperty({
    description: 'Fee amount',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'Academic year ID',
    example: '6811eb8c7299d79a4c14de08',
  })
  academicYearId: string;

  @ApiProperty({
    description: 'Term or semester ID',
    example: '681217c9cebe33b828ee5638',
  })
  termId: string;

  @ApiProperty({
    description: 'Discount amount',
    example: 5000,
  })
  discountAmount?: number;

  @ApiProperty({
    description: 'Discount percentage',
    example: 10,
  })
  discountPercentage?: number;

  @ApiProperty({
    description: 'Status of the fee structure',
    enum: FeeStatus,
    example: FeeStatus.ACTIVE,
  })
  status: FeeStatus;

  @ApiProperty({
    description: 'Due date for payment',
    example: '2025-08-20T22:00:00.000Z',
  })
  dueDate?: string;

  @ApiProperty({
    description: 'Late fee rules configuration',
    type: LateFeeRulesDto,
    example: {
      gracePeriod: 10,
      lateFeeAmount: 10,
      lateFeePercentage: 5
    },
  })
  lateFeeRules?: LateFeeRulesDto;

  @ApiProperty({
    description: 'School ID where this fee structure applies',
    example: '507f1f77bcf86cd799439011',
  })
  school: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;

  // Legacy fields for backward compatibility
  @ApiProperty({
    description: 'Whether the fee structure is active (deprecated, use status instead)',
    example: true,
    deprecated: true,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Late fee amount (deprecated, use lateFeeRules instead)',
    example: 1000,
    deprecated: true,
  })
  lateFeeAmount?: number;

  @ApiProperty({
    description: 'Late fee percentage (deprecated, use lateFeeRules instead)',
    example: 5,
    deprecated: true,
  })
  lateFeePercentage?: number;

  @ApiProperty({
    description: 'Grace period in days (deprecated, use lateFeeRules instead)',
    example: 7,
    deprecated: true,
  })
  gracePeriodDays?: number;
}
