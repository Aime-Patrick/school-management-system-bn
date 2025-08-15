import { ApiProperty } from '@nestjs/swagger';
import { BookStatus } from '../schemas/book.schema';

export class BookResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the book',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Book title',
    example: 'The Great Gatsby',
  })
  title: string;

  @ApiProperty({
    description: 'Book authors',
    example: ['F. Scott Fitzgerald'],
    type: [String],
  })
  authors: string[];

  @ApiProperty({
    description: 'International Standard Book Number',
    example: '978-0743273565',
  })
  ISBN?: string;

  @ApiProperty({
    description: 'Book publisher',
    example: 'Scribner',
  })
  publisher?: string;

  @ApiProperty({
    description: 'Book category/genre',
    example: 'Fiction',
  })
  category?: string;

  @ApiProperty({
    description: 'Book language',
    example: 'English',
  })
  language?: string;

  @ApiProperty({
    description: 'Book edition',
    example: '1st Edition',
  })
  edition?: string;

  @ApiProperty({
    description: 'Total number of copies available',
    example: 5,
  })
  totalCopies: number;

  @ApiProperty({
    description: 'Number of copies currently available',
    example: 3,
  })
  availableCopies: number;

  @ApiProperty({
    description: 'Book location in library',
    example: 'Shelf A-12',
  })
  location?: string;

  @ApiProperty({
    description: 'URL to book cover image',
    example: 'https://example.com/cover.jpg',
  })
  coverImageUrl?: string;

  @ApiProperty({
    description: 'Book status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  school?: string;

  @ApiProperty({
    description: 'Book description',
    example: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
  })
  description?: string;

  @ApiProperty({
    description: 'Publication year',
    example: 1925,
  })
  publicationYear?: number;

  @ApiProperty({
    description: 'Number of pages',
    example: 180,
  })
  pages?: number;

  @ApiProperty({
    description: 'Book format',
    example: 'Hardcover',
  })
  format?: string;

  @ApiProperty({
    description: 'Total number of times this book has been borrowed',
    example: 25,
  })
  borrowCount: number;

  @ApiProperty({
    description: 'Current number of reservations for this book',
    example: 2,
  })
  reservationCount: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-01T10:00:00.000Z',
  })
  updatedAt: Date;
}
