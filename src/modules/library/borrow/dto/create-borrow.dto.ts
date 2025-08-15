import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateBorrowDto {
  @ApiProperty({
    description: 'Member ID who is borrowing the book',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  memberId: string;

  @ApiProperty({
    description: 'Book ID to be borrowed',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  bookId: string;

  @ApiProperty({
    description: 'Due date for returning the book',
    example: '2024-12-15T10:00:00.000Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    description: 'User ID who is issuing the book',
    example: '507f1f77bcf86cd799439014',
    required: false,
  })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiProperty({
    description: 'Additional notes about the borrowing',
    example: 'Student requested extended due date',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Number of days to borrow (alternative to dueDate)',
    example: 14,
    minimum: 1,
    maximum: 90,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  borrowDays?: number;
}
