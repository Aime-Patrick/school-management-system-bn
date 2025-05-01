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

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsNotEmpty()
  credits: number;

}