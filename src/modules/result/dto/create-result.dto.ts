import { IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SubjectResultDto {
  @ApiProperty({
    example: 'Math',
    description: 'The name of the subject',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 85,
    description: 'The score obtained in the subject',
  })
  @IsNumber()
  score: number;

  @ApiProperty({
    example: 100,
    description: 'The maximum possible score for the subject',
  })
  @IsNumber()
  maxScore: number;
}

export class CreateResultDto {
  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'The ID of the student',
  })
  @IsString()
  student: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109cb',
    description: 'The ID of the class',
  })
  @IsString()
  class: string;

  @ApiProperty({
    example: 'Midterm',
    description: 'The type of the exam',
    enum: ['Midterm', 'Final', 'Assessment'],
  })
  @IsString()
  examType: string;

  @ApiProperty({
    example: [
      { subject: 'Math', score: 85, maxScore: 100 },
      { subject: 'Science', score: 90, maxScore: 100 },
    ],
    description: 'The list of subject results',
    type: [SubjectResultDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectResultDto)
  subjectResults: SubjectResultDto[];


  @ApiProperty({
    example: 87.5,
    description: 'The percentage score',
  })
  @IsNumber()
  percentage: number;

  @ApiProperty({
    example: 'Excellent performance',
    description: 'Remarks or feedback for the result',
    required: false,
  })
  @IsString()
  remarks?: string;
}
