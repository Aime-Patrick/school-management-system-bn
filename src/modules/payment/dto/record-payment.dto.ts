import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsMongoId, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordPaymentDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({ example: 5000 })
  @IsNumber({},{message: "Amount must be a number"})
  @Type(() => Number)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: '2023-09-20T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'quarterly', 'yearly'] })
  @IsString()
  @IsEnum(['monthly', 'quarterly', 'yearly'])
  @IsNotEmpty()
  plan: string;

  @IsOptional()
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  proof?: any;

}