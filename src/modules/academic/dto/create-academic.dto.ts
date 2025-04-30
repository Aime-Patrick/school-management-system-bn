import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAcademicDto {
  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', description: 'The start date of the academic year' })
  @IsDate()
  @IsNotEmpty(
    { message: 'Start date is required' }
  )
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2025-12-31T23:59:59.999Z', description: 'The end date of the academic year' })
  @IsDate()
  @IsNotEmpty(
    { message: 'End date is required' }
  )
  @Type(() => Date)
  endDate: Date;
}