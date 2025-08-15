import { ApiProperty } from '@nestjs/swagger';
import { FeeFrequency } from '../../../schemas/fee-category.schema';

export class FeeCategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the fee category',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Name of the fee category',
    example: 'Tuition Fee',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the fee category',
    example: 'Monthly tuition fee for academic classes',
  })
  description: string;

  @ApiProperty({
    description: 'Payment frequency for this fee category',
    enum: FeeFrequency,
    example: FeeFrequency.MONTHLY,
  })
  frequency: FeeFrequency;

  @ApiProperty({
    description: 'School ID where this fee category applies',
    example: '507f1f77bcf86cd799439011',
  })
  school: string;

  @ApiProperty({
    description: 'Whether the fee category is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this is a custom fee category',
    example: false,
  })
  isCustom: boolean;

  @ApiProperty({
    description: 'Custom fields for the fee category',
    example: ['field1', 'field2'],
  })
  customFields: string[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
