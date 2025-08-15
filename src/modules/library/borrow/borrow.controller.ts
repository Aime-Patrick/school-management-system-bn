import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Put,
  Request,
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
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { BorrowStatus } from './schemas/borrow-record.schema';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';

@ApiTags('Library - Borrowing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library/borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Borrow a book',
    description: 'Issues a book to a library member. Only admins, teachers, and librarians can issue books.',
  })
  @ApiBody({
    type: CreateBorrowDto,
    description: 'Book borrowing data',
    examples: {
      standardBorrow: {
        summary: 'Standard Book Borrowing',
        value: {
          memberId: '507f1f77bcf86cd799439011',
          bookId: '507f1f77bcf86cd799439012',
          dueDate: '2024-12-15T10:00:00.000Z',
          school: '507f1f77bcf86cd799439013',
          note: 'Student requested extended due date',
        },
      },
      borrowWithDays: {
        summary: 'Borrow with Days Specification',
        value: {
          memberId: '507f1f77bcf86cd799439011',
          bookId: '507f1f77bcf86cd799439012',
          borrowDays: 21,
          school: '507f1f77bcf86cd799439013',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Book borrowed successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        memberId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        bookId: { type: 'string', example: '507f1f77bcf86cd799439012' },
        borrowDate: { type: 'string', format: 'date-time' },
        dueDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: Object.values(BorrowStatus), example: 'ISSUED' },
        note: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or borrowing not allowed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member or book not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - member limit reached or book unavailable',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async borrowBook(
    @Body() createBorrowDto: CreateBorrowDto,
    @Request() req: any,
  ) {
    const issuedBy = req.user?.id;
    return await this.borrowService.borrowBook(createBorrowDto, issuedBy);
  }

  @Post('return/:id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Return a borrowed book',
    description: 'Processes the return of a borrowed book and calculates any applicable fines.',
  })
  @ApiParam({
    name: 'id',
    description: 'Borrow record ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
          description: 'Return notes or comments',
          example: 'Book returned in good condition',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book returned successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        status: { type: 'string', example: 'RETURNED' },
        returnDate: { type: 'string', format: 'date-time' },
        fineAmount: { type: 'number', example: 5 },
        daysOverdue: { type: 'number', example: 5 },
        returnNotes: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid borrow record ID or book already returned',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Borrow record not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async returnBook(
    @Param('id') id: string,
    @Body('notes') notes?: string,
    @Request() req?: any,
  ) {
    const returnedTo = req?.user?.id;
    return await this.borrowService.returnBook(id, returnedTo, notes);
  }

  @Put(':id/renew')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Renew a borrowed book',
    description: 'Extends the due date for a borrowed book.',
  })
  @ApiParam({
    name: 'id',
    description: 'Borrow record ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newDueDate: {
          type: 'string',
          format: 'date-time',
          description: 'New due date (optional, will use default renewal period if not provided)',
          example: '2024-12-20T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book renewed successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        dueDate: { type: 'string', format: 'date-time' },
        isRenewed: { type: 'boolean', example: true },
        renewalCount: { type: 'number', example: 1 },
        status: { type: 'string', example: 'ISSUED' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid borrow record ID or renewal not allowed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Borrow record not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async renewBook(
    @Param('id') id: string,
    @Body('newDueDate') newDueDate?: string,
    @Request() req?: any,
  ) {
    const renewedBy = req?.user?.id;
    return await this.borrowService.renewBook(id, newDueDate, renewedBy);
  }

  @Put(':id/lost')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Mark book as lost',
    description: 'Marks a borrowed book as lost and applies replacement cost fine.',
  })
  @ApiParam({
    name: 'id',
    description: 'Borrow record ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
          description: 'Notes about the lost book',
          example: 'Student reported book lost during move',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book marked as lost successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        status: { type: 'string', example: 'LOST' },
        fineAmount: { type: 'number', example: 25 },
        note: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid borrow record ID or book already returned',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Borrow record not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async markBookAsLost(
    @Param('id') id: string,
    @Body('notes') notes?: string,
    @Request() req?: any,
  ) {
    const markedBy = req?.user?.id;
    return await this.borrowService.markBookAsLost(id, markedBy, notes);
  }

  @Put(':id/damaged')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Mark book as damaged',
    description: 'Marks a borrowed book as damaged and applies damage cost fine.',
  })
  @ApiParam({
    name: 'id',
    description: 'Borrow record ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        damageDescription: {
          type: 'string',
          description: 'Description of the damage',
          example: 'Water damage to pages 15-20',
        },
      },
      required: ['damageDescription'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book marked as damaged successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        status: { type: 'string', example: 'DAMAGED' },
        fineAmount: { type: 'number', example: 15 },
        damageDescription: { type: 'string' },
        note: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid borrow record ID, book already returned, or missing damage description',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Borrow record not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async markBookAsDamaged(
    @Param('id') id: string,
    @Body('damageDescription') damageDescription: string,
    @Request() req?: any,
  ) {
    const markedBy = req?.user?.id;
    return await this.borrowService.markBookAsDamaged(id, damageDescription, markedBy);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all borrow records',
    description: 'Retrieves a paginated list of all borrow records with optional filtering.',
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
    name: 'status',
    required: false,
    enum: BorrowStatus,
    description: 'Filter by borrow status',
    example: BorrowStatus.ISSUED,
  })
  @ApiQuery({
    name: 'memberId',
    required: false,
    type: String,
    description: 'Filter by member ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'bookId',
    required: false,
    type: String,
    description: 'Filter by book ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439013',
  })
  @ApiQuery({
    name: 'overdue',
    required: false,
    type: String,
    description: 'Filter for overdue books (true/false)',
    example: 'true',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter by borrow date from (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter by borrow date to (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Borrow records retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              memberId: { type: 'object' },
              bookId: { type: 'object' },
              borrowDate: { type: 'string', format: 'date-time' },
              dueDate: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              fineAmount: { type: 'number' },
            },
          },
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
    return await this.borrowService.findAll(query);
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'Get overdue books',
    description: 'Retrieves all books that are currently overdue.',
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
    description: 'Overdue books retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          memberId: { type: 'object' },
          bookId: { type: 'object' },
          dueDate: { type: 'string', format: 'date-time' },
          daysOverdue: { type: 'number' },
          fineAmount: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getOverdueRecords(@Query('school') schoolId?: string) {
    return await this.borrowService.getOverdueRecords(schoolId);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get borrowing statistics',
    description: 'Retrieves comprehensive statistics about book borrowing.',
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter by date from (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter by date to (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Borrowing statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalBorrows: { type: 'number', example: 500 },
        totalReturns: { type: 'number', example: 450 },
        totalOverdue: { type: 'number', example: 30 },
        totalLost: { type: 'number', example: 5 },
        totalDamaged: { type: 'number', example: 15 },
        totalFines: { type: 'number', example: 250 },
        averageBorrowDuration: { type: 'number', example: 1209600000 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getBorrowingStatistics(
    @Query('school') schoolId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return await this.borrowService.getBorrowingStatistics(schoolId, dateFrom, dateTo);
  }

  @Get('member/:memberId')
  @ApiOperation({
    summary: 'Get member borrowing history',
    description: 'Retrieves the complete borrowing history for a specific member.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member borrowing history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          bookId: { type: 'object' },
          borrowDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          returnDate: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
          fineAmount: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid member ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByMember(@Param('memberId') memberId: string) {
    return await this.borrowService.findByMember(memberId);
  }

  @Get('book/:bookId')
  @ApiOperation({
    summary: 'Get book borrowing history',
    description: 'Retrieves the complete borrowing history for a specific book.',
  })
  @ApiParam({
    name: 'bookId',
    description: 'Book ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book borrowing history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          memberId: { type: 'object' },
          borrowDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          returnDate: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
          fineAmount: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid book ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByBook(@Param('bookId') bookId: string) {
    return await this.borrowService.findByBook(bookId);
  }

  @Get('member/:memberId/history')
  @ApiOperation({
    summary: 'Get member borrowing statistics',
    description: 'Retrieves statistical information about a member\'s borrowing history.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member borrowing statistics retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          count: { type: 'number' },
          totalFines: { type: 'number' },
          averageDaysOverdue: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid member ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getMemberBorrowingHistory(@Param('memberId') memberId: string) {
    return await this.borrowService.getMemberBorrowingHistory(memberId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a borrow record by ID',
    description: 'Retrieves a specific borrow record by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Borrow record ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Borrow record retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        memberId: { type: 'object' },
        bookId: { type: 'object' },
        borrowDate: { type: 'string', format: 'date-time' },
        dueDate: { type: 'string', format: 'date-time' },
        returnDate: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        fineAmount: { type: 'number' },
        daysOverdue: { type: 'number' },
        note: { type: 'string' },
        isRenewed: { type: 'boolean' },
        renewalCount: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid borrow record ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Borrow record not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findOne(@Param('id') id: string) {
    return await this.borrowService.findOne(id);
  }
}
