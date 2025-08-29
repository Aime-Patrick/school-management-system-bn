// src/modules/fees/dto/auto-assign-fees.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, IsDateString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class AutoAssignFeesDto {
  @ApiProperty({
    description: 'Fee Structure ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  feeStructureId: string;

  @ApiProperty({
    description: 'Student ID (for individual assignment)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({
    description: 'Class IDs (for bulk assignment)',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  classIds?: string[];

  @ApiProperty({
    description: 'Student IDs (for bulk assignment)',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439015'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];

  @ApiProperty({
    description: 'Assign to all classes in the school',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  assignToAllClasses?: boolean;

  @ApiProperty({
    description: 'Assign to all students in selected classes',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  assignToAllStudents?: boolean;

  @ApiProperty({
    description: 'Due date for the fee assignment',
    example: '2024-09-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Send notification to students/parents',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @ApiProperty({
    description: 'Additional notes for the assignment',
    example: 'Term 1 fees assignment',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}