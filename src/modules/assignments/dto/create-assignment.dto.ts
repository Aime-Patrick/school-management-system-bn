import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Mathematics Assignment 1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Solve the given equations' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2023-09-20T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsMongoId()
  @IsNotEmpty()
  course: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109cc' })
  @IsMongoId()
  @IsNotEmpty()
  term: string;
}