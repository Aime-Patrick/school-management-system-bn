import { IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SubjectResultDto {
  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'The id of the course',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    example: 85,
    description: 'The score obtained in the course',
  })
  @IsNumber()
  score: number;

  @ApiProperty({
    example: 100,
    description: 'The maximum possible score for the course',
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
      { courseId: '60d0fe4f5311236168a109ca', score: 85, maxScore: 100 },
      { courseId: '60d0fe4f5311236168a109cb', score: 90, maxScore: 100 },
    ],
    description: 'The list of courses results',
    type: [SubjectResultDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectResultDto)
  subjectResults: SubjectResultDto[];

}
