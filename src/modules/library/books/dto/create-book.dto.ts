import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNumber, IsEnum, Min, IsUrl, IsInt } from 'class-validator';
import { BookStatus } from '../schemas/book.schema';

export class CreateBookDto {
  @ApiProperty({
    description: 'Book title',
    example: 'The Great Gatsby',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Book authors',
    example: ['F. Scott Fitzgerald'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  authors: string[];

  @ApiProperty({
    description: 'International Standard Book Number',
    example: '978-0743273565',
    required: false,
  })
  @IsOptional()
  @IsString()
  ISBN?: string;

  @ApiProperty({
    description: 'Book publisher',
    example: 'Scribner',
    required: false,
  })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty({
    description: 'Book category/genre',
    example: 'Fiction',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Book language',
    example: 'English',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Book edition',
    example: '1st Edition',
    required: false,
  })
  @IsOptional()
  @IsString()
  edition?: string;

  @ApiProperty({
    description: 'Total number of copies available',
    example: 5,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopies?: number;

  @ApiProperty({
    description: 'Book location in library',
    example: 'Shelf A-12',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'URL to book cover image',
    example: 'https://example.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiProperty({
    description: 'Book status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE,
    default: BookStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    description: 'Book description',
    example: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Publication year',
    example: 1925,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  publicationYear?: number;

  @ApiProperty({
    description: 'Number of pages',
    example: 180,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number;

  @ApiProperty({
    description: 'Book format',
    example: 'Hardcover',
    required: false,
  })
  @IsOptional()
  @IsString()
  format?: string;
}
