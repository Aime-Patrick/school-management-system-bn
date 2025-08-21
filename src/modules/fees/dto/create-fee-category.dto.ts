import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { FeeFrequency } from '../../../schemas/fee-category.schema';

export class CreateFeeCategoryDto {
  @ApiProperty({
    description: 'Name of the fee category',
    example: 'Tuition Fee',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the fee category',
    example: 'Monthly tuition fee for academic classes',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Payment frequency for this fee category',
    enum: FeeFrequency,
    example: FeeFrequency.MONTHLY,
  })
  @IsEnum(FeeFrequency)
  frequency: FeeFrequency;


  @ApiProperty({
    description: 'Whether the fee category is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether this is a custom fee category',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;

  @ApiProperty({
    description: 'Custom fields for the fee category',
    example: ['field1', 'field2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customFields?: string[];
}
