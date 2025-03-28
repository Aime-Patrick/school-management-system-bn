import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsMongoId, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  payerName: string;

  @ApiProperty({ example: 'Tuition', enum: ['Tuition', 'Library Fee', 'Transport', 'Others'] })
  @IsString()
  @IsEnum(['Tuition', 'Library Fee', 'Transport', 'Others'])
  @IsNotEmpty()
  paymentType: string;

  @ApiProperty({ example: 500 })
  @IsNumber({},{message: "Amount must be a number"})
  @Type(() => Number)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: '2023-09-20T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 'Paid', enum: ['Paid', 'Unpaid'] })
  @IsString()
  @IsEnum(['Paid', 'Unpaid'])
  @IsNotEmpty()
  status: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  receipt?: any;

}