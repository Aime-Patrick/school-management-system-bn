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
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberRole, MemberStatus } from './schemas/member.schema';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';

@ApiTags('Library - Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Create a new library member',
    description: 'Creates a new library member with the specified details. Only admins, teachers, and librarians can create members.',
  })
  @ApiBody({
    type: CreateMemberDto,
    description: 'Member creation data',
    examples: {
      student: {
        summary: 'Student Member',
        value: {
          userId: '507f1f77bcf86cd799439011',
          memberId: 'LIB001',
          role: 'STUDENT',
          classOrDept: 'Class 10A',
          maxBorrowLimit: 3,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@school.com',
          phoneNumber: '+1234567890',
        },
      },
      teacher: {
        summary: 'Teacher Member',
        value: {
          userId: '507f1f77bcf86cd799439012',
          memberId: 'LIB002',
          role: 'TEACHER',
          classOrDept: 'Mathematics Department',
          maxBorrowLimit: 5,
          firstName: 'Dr. Smith',
          lastName: 'Johnson',
          email: 'smith.johnson@school.com',
        },
      },
      librarian: {
        summary: 'Librarian Member',
        value: {
          userId: '507f1f77bcf86cd799439013',
          memberId: 'LIB003',
          role: 'LIBRARIAN',
          classOrDept: 'Library Department',
          maxBorrowLimit: 10,
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah.wilson@school.com',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Member created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        memberId: { type: 'string', example: 'LIB001' },
        role: { type: 'string', enum: Object.values(MemberRole), example: 'STUDENT' },
        status: { type: 'string', enum: Object.values(MemberStatus), example: 'ACTIVE' },
        joinDate: { type: 'string', format: 'date-time' },
        maxBorrowLimit: { type: 'number', example: 3 },
        currentBorrowCount: { type: 'number', example: 0 },
        totalBorrowCount: { type: 'number', example: 0 },
        overdueCount: { type: 'number', example: 0 },
        fineAmount: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - user already member or member ID exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async create(@Body() createMemberDto: CreateMemberDto) {
    return await this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all library members',
    description: 'Retrieves a paginated list of library members with optional filtering.',
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
    name: 'role',
    required: false,
    enum: MemberRole,
    description: 'Filter by member role',
    example: MemberRole.STUDENT,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: MemberStatus,
    description: 'Filter by member status',
    example: MemberStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, member ID, or email',
    example: 'john',
  })
  @ApiQuery({
    name: 'classOrDept',
    required: false,
    type: String,
    description: 'Filter by class or department',
    example: 'Class 10A',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Members retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              userId: { type: 'string' },
              memberId: { type: 'string' },
              role: { type: 'string' },
              status: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              currentBorrowCount: { type: 'number' },
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
    return await this.membersService.findAll(query);
  }

  @Get('role/:role')
  @ApiOperation({
    summary: 'Get members by role',
    description: 'Retrieves all members with a specific role.',
  })
  @ApiParam({
    name: 'role',
    description: 'Member role',
    enum: MemberRole,
    example: MemberRole.STUDENT,
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
    description: 'Members retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          memberId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getMembersByRole(
    @Param('role') role: MemberRole,
    @Query('school') schoolId?: string,
  ) {
    return await this.membersService.getMembersByRole(role, schoolId);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active members',
    description: 'Retrieves all active library members.',
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
    description: 'Active members retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          memberId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string' },
          currentBorrowCount: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getActiveMembers(@Query('school') schoolId?: string) {
    return await this.membersService.getActiveMembers(schoolId);
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'Get members with overdue books',
    description: 'Retrieves all members who have overdue books.',
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
    description: 'Members with overdue books retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          memberId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          overdueCount: { type: 'number' },
          fineAmount: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getMembersWithOverdueBooks(@Query('school') schoolId?: string) {
    return await this.membersService.getMembersWithOverdueBooks(schoolId);
  }

  @Get('fines')
  @ApiOperation({
    summary: 'Get members with fines',
    description: 'Retrieves all members who have outstanding fines.',
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
    description: 'Members with fines retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          memberId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          fineAmount: { type: 'number' },
          overdueCount: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getMembersWithFines(@Query('school') schoolId?: string) {
    return await this.membersService.getMembersWithFines(schoolId);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get member statistics',
    description: 'Retrieves comprehensive statistics about library members.',
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
    description: 'Member statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalMembers: { type: 'number', example: 150 },
        activeMembers: { type: 'number', example: 120 },
        inactiveMembers: { type: 'number', example: 20 },
        suspendedMembers: { type: 'number', example: 10 },
        students: { type: 'number', example: 100 },
        teachers: { type: 'number', example: 30 },
        staff: { type: 'number', example: 20 },
        librarians: { type: 'number', example: 5 },
        totalFines: { type: 'number', example: 1500 },
        averageFines: { type: 'number', example: 10 },
        totalBorrows: { type: 'number', example: 500 },
        averageBorrows: { type: 'number', example: 3.33 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async getMemberStatistics(@Query('school') schoolId?: string) {
    return await this.membersService.getMemberStatistics(schoolId);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get member by user ID',
    description: 'Retrieves a library member by their user ID from the main system.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID from main system',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        userId: { type: 'string' },
        memberId: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        currentBorrowCount: { type: 'number' },
        fineAmount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid user ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByUserId(@Param('userId') userId: string) {
    return await this.membersService.findByUserId(userId);
  }

  @Get('member/:memberId')
  @ApiOperation({
    summary: 'Get member by library member ID',
    description: 'Retrieves a library member by their library member ID.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Library member ID',
    example: 'LIB001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        userId: { type: 'string' },
        memberId: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        currentBorrowCount: { type: 'number' },
        fineAmount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findByMemberId(@Param('memberId') memberId: string) {
    return await this.membersService.findByMemberId(memberId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a member by ID',
    description: 'Retrieves a specific library member by their unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        userId: { type: 'string' },
        memberId: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phoneNumber: { type: 'string' },
        classOrDept: { type: 'string' },
        joinDate: { type: 'string', format: 'date-time' },
        expiryDate: { type: 'string', format: 'date-time' },
        maxBorrowLimit: { type: 'number' },
        currentBorrowCount: { type: 'number' },
        totalBorrowCount: { type: 'number' },
        overdueCount: { type: 'number' },
        fineAmount: { type: 'number' },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid member ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findOne(@Param('id') id: string) {
    return await this.membersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Update a member',
    description: 'Updates an existing library member. Only admins, teachers, and librarians can update members.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    description: 'Member update data (partial)',
    examples: {
      updateStatus: {
        summary: 'Update Member Status',
        value: {
          status: 'SUSPENDED',
          notes: 'Member suspended due to overdue books',
        },
      },
      updateLimits: {
        summary: 'Update Borrowing Limits',
        value: {
          maxBorrowLimit: 5,
          expiryDate: '2025-12-31T23:59:59.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        memberId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        status: { type: 'string' },
        maxBorrowLimit: { type: 'number' },
        currentBorrowCount: { type: 'number' },
        fineAmount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or invalid member ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - member ID already exists',
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
    @Body() updateMemberDto: any,
  ) {
    return await this.membersService.update(id, updateMemberDto);
  }

  @Put(':id/status')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: 'Change member status',
    description: 'Changes the status of a library member. Only admins, teachers, and librarians can change member status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(MemberStatus),
          description: 'New member status',
          example: MemberStatus.SUSPENDED,
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member status changed successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        memberId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid member ID or status',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found',
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
    @Body('status') status: MemberStatus,
  ) {
    return await this.membersService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete a member',
    description: 'Deletes a library member. Only admins can delete members, and only if they have no borrowed books or unpaid fines.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid member ID or member has borrowed books/fines',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found',
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
    return await this.membersService.remove(id);
  }
}
