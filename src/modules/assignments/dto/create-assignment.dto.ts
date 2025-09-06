import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsMongoId, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentStatus } from '../../../schemas/assignment.schema';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Mathematics Assignment 1', description: 'Title of the assignment' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Complete all exercises in Chapter 5', description: 'Description of the assignment' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2025-09-15T23:59:59.000Z', description: 'Due date for the assignment' })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({ example: '60d0fe4f5311236168a109ca', description: 'Course ID' })
  @IsMongoId()
  @IsNotEmpty()
  course: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109cb', description: 'Term ID' })
  @IsMongoId()
  @IsNotEmpty()
  term: string;

  @ApiProperty({ example: 100, description: 'Maximum score for the assignment', default: 100 })
  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @ApiProperty({ example: 'Follow the instructions carefully', description: 'Additional instructions for students' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ example: true, description: 'Whether to allow late submissions', default: false })
  @IsBoolean()
  @IsOptional()
  allowLateSubmission?: boolean;

  @ApiProperty({ example: 10, description: 'Percentage penalty for late submissions', default: 0 })
  @IsNumber()
  @IsOptional()
  lateSubmissionPenalty?: number;

  @ApiProperty({ 
    example: ['pdf', 'doc', 'docx', 'jpg', 'png'], 
    description: 'Allowed file types for submissions',
    default: ['pdf', 'doc', 'docx']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedFileTypes?: string[];

  @ApiProperty({ example: 10, description: 'Maximum file size in MB', default: 10 })
  @IsNumber()
  @IsOptional()
  maxFileSize?: number;

  @ApiProperty({ example: 5, description: 'Maximum number of files per submission', default: 5 })
  @IsNumber()
  @IsOptional()
  maxFilesPerSubmission?: number;

  @ApiProperty({ 
    example: '60d0fe4f5311236168a109cc', 
    description: 'Class ID to assign the assignment to (optional - use with classCombinationIds)'
  })
  @IsMongoId()
  @IsOptional()
  classId?: string;

  @ApiProperty({ 
    example: ['60d0fe4f5311236168a109cc', '60d0fe4f5311236168a109cd'], 
    description: 'Array of class combination IDs (optional - if not provided, assigns to all combinations in the class)'
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  classCombinationIds?: string[];

  @ApiProperty({ 
    example: true, 
    description: 'Whether to assign to all combinations in the class (default: true)',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  assignToAllCombinations?: boolean;

  @ApiProperty({ 
    example: ['60d0fe4f5311236168a109cc', '60d0fe4f5311236168a109cd'], 
    description: 'Array of specific student IDs (optional - can be used instead of or in addition to class combinations)'
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  assignedStudents?: string[];

  @ApiProperty({ 
    example: 'draft', 
    enum: ['draft', 'published'], 
    description: 'Status of the assignment',
    default: 'draft'
  })
  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;
}