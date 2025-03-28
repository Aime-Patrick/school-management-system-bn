import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordScoreDto {
  @ApiProperty({ example: 'studentID' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  studentId: string; 

  @ApiProperty({ example: '20' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  score: number

}