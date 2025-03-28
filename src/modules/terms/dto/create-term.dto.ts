import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTermDto {
  @ApiProperty({ example: 'Term 1', description: 'The name of the term' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', description: 'The start date of the term' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2025-03-31T23:59:59.999Z', description: 'The end date of the term' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;
}