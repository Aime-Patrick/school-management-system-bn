import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizDto {
  @ApiProperty({ example: 'Mathematics Quiz 1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2023-09-15T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsMongoId()
  @IsNotEmpty()
  course: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109cb' })
  @IsMongoId()
  @IsNotEmpty()
  teacher: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109cc' })
  @IsMongoId()
  @IsNotEmpty()
  term: string;
}