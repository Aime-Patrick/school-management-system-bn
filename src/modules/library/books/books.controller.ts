import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { BookStatus } from './schemas/book.schema';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';

@ApiTags('Library - Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Add a new book to the library',
    description: 'Creates a new book record with the specified details. Only admins, teachers, and librarians can add books.',
  })
  @ApiBody({
    type: CreateBookDto,
    description: 'Book creation data',
    examples: {
      fictionBook: {
        summary: 'Fiction Book',
        value: {
          title: 'The Great Gatsby',
          authors: ['F. Scott Fitzgerald'],
          ISBN: '978-0743273565',
          publisher: 'Scribner',
          category: 'Fiction',
          language: 'English',
          edition: '1st Edition',
          totalCopies: 5,
          location: 'Shelf A-12',
          description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
          publicationYear: 1925,
          pages: 180,
          format: 'Hardcover',
        },
      },
      textbook: {
        summary: 'Textbook',
        value: {
          title: 'Advanced Mathematics',
          authors: ['Dr. Smith', 'Prof. Johnson'],
          category: 'Textbook',
          language: 'English',
          totalCopies: 10,
          location: 'Shelf B-05',
          description: 'Comprehensive mathematics textbook for advanced students.',
          publicationYear: 2023,
          pages: 450,
          format: 'Paperback',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Book created successfully',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - ISBN already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async create(@Body() createBookDto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.booksService.create(createBookDto);
    return this.transformToResponseDto(book);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all books',
    description: 'Retrieves a paginated list of books with optional filtering and search capabilities.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search books by title, author, or ISBN',
    example: 'gatsby',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by book category',
    example: 'Fiction',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Filter by book language',
    example: 'English',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BookStatus,
    description: 'Filter by book status',
    example: BookStatus.AVAILABLE,
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'author',
    required: false,
    type: String,
    description: 'Filter by author name',
    example: 'Fitzgerald',
  })
  @ApiQuery({
    name: 'publisher',
    required: false,
    type: String,
    description: 'Filter by publisher',
    example: 'Scribner',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Books retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BookResponseDto' },
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findAll(@Query() query: any) {
    return await this.booksService.findAll(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search books',
    description: 'Search books by title, author, or ISBN using text search.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
    example: 'gatsby',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
    type: [BookResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async searchBooks(@Query('q') query: string): Promise<BookResponseDto[]> {
    const books = await this.booksService.searchBooks(query);
    return books.map(book => this.transformToResponseDto(book));
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Get books by category',
    description: 'Retrieves all books in a specific category.',
  })
  @ApiParam({
    name: 'category',
    description: 'Book category',
    example: 'Fiction',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Books retrieved successfully',
    type: [BookResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getBooksByCategory(@Param('category') category: string): Promise<BookResponseDto[]> {
    const books = await this.booksService.getBooksByCategory(category);
    return books.map(book => this.transformToResponseDto(book));
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get available books',
    description: 'Retrieves all books that are currently available for borrowing.',
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available books retrieved successfully',
    type: [BookResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getAvailableBooks(@Query('school') schoolId?: string): Promise<BookResponseDto[]> {
    const books = await this.booksService.getAvailableBooks(schoolId);
    return books.map(book => this.transformToResponseDto(book));
  }

  @Get('most-borrowed')
  @ApiOperation({
    summary: 'Get most borrowed books',
    description: 'Retrieves the most frequently borrowed books.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of books to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Most borrowed books retrieved successfully',
    type: [BookResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getMostBorrowedBooks(@Query('limit') limit: number = 10): Promise<BookResponseDto[]> {
    const books = await this.booksService.getMostBorrowedBooks(limit);
    return books.map(book => this.transformToResponseDto(book));
  }

  @Get('school/:schoolId')
  @ApiOperation({
    summary: 'Get books by school',
    description: 'Retrieves all books for a specific school.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Books retrieved successfully',
    type: [BookResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid school ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getBooksBySchool(@Param('schoolId') schoolId: string): Promise<BookResponseDto[]> {
    const books = await this.booksService.getBooksBySchool(schoolId);
    return books.map(book => this.transformToResponseDto(book));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a book by ID',
    description: 'Retrieves a specific book by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book retrieved successfully',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid book ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findOne(@Param('id') id: string): Promise<BookResponseDto> {
    const book = await this.booksService.findOne(id);
    return this.transformToResponseDto(book);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Update a book',
    description: 'Updates an existing book. Only admins, teachers, and librarians can update books.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateBookDto,
    description: 'Book update data (partial)',
    examples: {
      updateCopies: {
        summary: 'Update Book Copies',
        value: {
          totalCopies: 8,
          location: 'Shelf A-15',
        },
      },
      updateStatus: {
        summary: 'Update Book Status',
        value: {
          status: 'DAMAGED',
          notes: 'Cover damaged, needs repair',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book updated successfully',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or invalid copies',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - ISBN already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookResponseDto> {
    const book = await this.booksService.update(id, updateBookDto);
    return this.transformToResponseDto(book);
  }

  @Put(':id/status')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Change book status',
    description: 'Changes the status of a book. Only admins, teachers, and librarians can change book status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(BookStatus),
          description: 'New book status',
          example: BookStatus.DAMAGED,
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book status changed successfully',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid book ID or status',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookStatus,
  ): Promise<BookResponseDto> {
    const book = await this.booksService.updateStatus(id, status);
    return this.transformToResponseDto(book);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete a book',
    description: 'Deletes a book. Only admins can delete books, and only if no copies are currently borrowed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid book ID or book has borrowed copies',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.booksService.remove(id);
  }

  private transformToResponseDto(book: any): BookResponseDto {
    return {
      _id: book._id?.toString() || book.id,
      title: book.title,
      authors: book.authors,
      ISBN: book.ISBN,
      publisher: book.publisher,
      category: book.category,
      language: book.language,
      edition: book.edition,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      location: book.location,
      coverImageUrl: book.coverImageUrl,
      status: book.status,
      school: book.school?._id?.toString() || book.school?.toString() || book.school,
      description: book.description,
      publicationYear: book.publicationYear,
      pages: book.pages,
      format: book.format,
      borrowCount: book.borrowCount,
      reservationCount: book.reservationCount,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }
}
