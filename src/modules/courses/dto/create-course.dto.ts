import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsArray, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateCourseDto {
  @ApiProperty({ example: 'Mathematics 101' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'An introductory course to Mathematics' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'MATH101' })
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: '2023-09-01T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date) 
  startDate: Date;

  @ApiProperty({ example: '2024-06-01T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date) 
  endDate: Date;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsNotEmpty()
  credits: number;

  @ApiProperty({ example: 'active' })
  @IsString()
  @IsNotEmpty()
  status: string;

}