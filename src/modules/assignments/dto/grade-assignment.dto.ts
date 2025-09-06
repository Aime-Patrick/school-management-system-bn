import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GradeAssignmentDto {
  @ApiProperty({ 
    example: 85, 
    description: 'Score given to the student (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ 
    example: 'Excellent work! Your solution shows deep understanding of the concepts.', 
    description: 'Feedback for the student'
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
