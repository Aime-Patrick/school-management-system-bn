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
  Req,
  BadRequestException,
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
import { FeeCategoryService } from '../services/fee-category.service';
import { CreateFeeCategoryDto } from '../dto/create-fee-category.dto';
import { QueryFeeCategoriesDto } from '../dto/query-fees.dto';
import { FeeCategoryResponseDto } from '../dto/fee-category-response.dto';
import { JwtAuthGuard } from '../../../guard/jwt-auth.guard';
import { RolesGuard } from '../../../guard/roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { UserRole } from '../../../schemas/user.schema';

@ApiTags('Fee Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees/categories')
export class FeeCategoryController {
  constructor(private readonly feeCategoryService: FeeCategoryService) {}

  private transformToResponseDto(feeCategory: any): FeeCategoryResponseDto {
    return {
      _id: feeCategory._id?.toString() || feeCategory.id,
      name: feeCategory.name,
      description: feeCategory.description,
      frequency: feeCategory.frequency,
      school: feeCategory.school?._id?.toString() || feeCategory.school?.toString() || feeCategory.school,
      isActive: feeCategory.isActive,
      isCustom: feeCategory.isCustom,
      customFields: feeCategory.customFields,
      createdAt: feeCategory.createdAt,
      updatedAt: feeCategory.updatedAt,
    };
  }

  private transformToResponseDtoArray(feeCategories: any[]): FeeCategoryResponseDto[] {
    return feeCategories.map(feeCategory => this.transformToResponseDto(feeCategory));
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Create a new fee category',
    description: 'Creates a new fee category with the specified details. Only admins and accountants can create fee categories.',
  })
  @ApiBody({
    type: CreateFeeCategoryDto,
    description: 'Fee category creation data (school ID is automatically derived from authenticated user)',
    examples: {
      tuition: {
        summary: 'Tuition Fee Category',
        value: {
          name: 'Tuition Fee',
          description: 'Monthly tuition fee for academic classes',
          frequency: 'monthly',
          isActive: true,
          isCustom: false,
        },
      },
      transport: {
        summary: 'Transport Fee Category',
        value: {
          name: 'Transport Fee',
          description: 'Monthly transportation fee for students using school transport',
          frequency: 'monthly',
          isActive: true,
          isCustom: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fee category created successfully',
    type: FeeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or duplicate name',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  async create(@Body() createFeeCategoryDto: CreateFeeCategoryDto, @Req() req): Promise<FeeCategoryResponseDto> {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found in user context');
    }
    const feeCategory = await this.feeCategoryService.create(createFeeCategoryDto, schoolId);
    return this.transformToResponseDto(feeCategory);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all fee categories',
    description: 'Retrieves a paginated list of fee categories with optional filtering and search capabilities.',
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
    name: 'name',
    required: false,
    type: String,
    description: 'Search by fee category name (case-insensitive)',
    example: 'tuition',
  })
  @ApiQuery({
    name: 'frequency',
    required: false,
    enum: ['monthly', 'term', 'semester', 'yearly', 'one_time'],
    description: 'Filter by payment frequency',
    example: 'monthly',
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'Filter by school ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/FeeCategoryResponseDto' },
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findAll(@Query() query: QueryFeeCategoriesDto, @Req() req) {
    // If no school is specified in query, use the authenticated user's school
    if (!query.school && req.user.schoolId) {
      query.school = req.user.schoolId;
    }
    return await this.feeCategoryService.findAll(query);
  }

  @Get('school/:schoolId')
  @ApiOperation({
    summary: 'Get fee categories by school',
    description: 'Retrieves all active fee categories for a specific school. Users can only access their own school\'s categories.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee categories retrieved successfully',
    type: [FeeCategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid school ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - cannot access categories from other schools',
  })
  async findBySchool(@Param('schoolId') schoolId: string, @Req() req): Promise<FeeCategoryResponseDto[]> {
    // Ensure users can only access their own school's categories
    if (req.user.schoolId && req.user.schoolId !== schoolId) {
      throw new BadRequestException('You can only access fee categories from your own school');
    }
    const feeCategories = await this.feeCategoryService.findBySchool(schoolId);
    return this.transformToResponseDtoArray(feeCategories);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get all active fee categories',
    description: 'Retrieves all active fee categories across all schools.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active fee categories retrieved successfully',
    type: [FeeCategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findActiveCategories(): Promise<FeeCategoryResponseDto[]> {
    const feeCategories = await this.feeCategoryService.findActiveCategories();
    return this.transformToResponseDtoArray(feeCategories);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a fee category by ID',
    description: 'Retrieves a specific fee category by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee category retrieved successfully',
    type: FeeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid fee category ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee category not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing authentication token',
  })
  async findOne(@Param('id') id: string): Promise<FeeCategoryResponseDto> {
    const feeCategory = await this.feeCategoryService.findOne(id);
    return this.transformToResponseDto(feeCategory);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Update a fee category',
    description: 'Updates an existing fee category. Only admins and accountants can update fee categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: CreateFeeCategoryDto,
    description: 'Fee category update data (partial)',
    examples: {
      updateName: {
        summary: 'Update Fee Category Name',
        value: {
          name: 'Updated Tuition Fee',
          description: 'Updated description for tuition fee',
        },
      },
      updateFrequency: {
        summary: 'Update Payment Frequency',
        value: {
          frequency: 'yearly',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee category updated successfully',
    type: FeeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error or duplicate name',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee category not found',
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
    @Body() updateFeeCategoryDto: Partial<CreateFeeCategoryDto>,
    @Req() req,
  ): Promise<FeeCategoryResponseDto> {
    const schoolId = req.user.schoolId;
    const feeCategory = await this.feeCategoryService.update(id, updateFeeCategoryDto, schoolId);
    return this.transformToResponseDto(feeCategory);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete a fee category',
    description: 'Deletes a fee category. Only admins can delete fee categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee category deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid fee category ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee category not found',
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
    return await this.feeCategoryService.remove(id);
  }
}
