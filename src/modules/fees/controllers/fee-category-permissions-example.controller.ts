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
import { PermissionsGuard } from '../../../guard/permissions.guard';
import { RequireCreate, RequireRead, RequireUpdate, RequireDelete, RequireView } from '../../../decorator/permissions.decorator';
import { PermissionResource } from '../../../schemas/permission.schema';

@ApiTags('Fee Categories (Dynamic Permissions Example)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fees/categories-permissions-example')
export class FeeCategoryPermissionsExampleController {
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
  @RequireCreate(PermissionResource.FEE_CATEGORIES)
  @ApiOperation({
    summary: 'Create a new fee category (Dynamic Permissions)',
    description: 'Creates a new fee category with the specified details. Uses dynamic permissions instead of static roles.',
  })
  @ApiBody({
    type: CreateFeeCategoryDto,
    description: 'Fee category creation data (school ID is automatically derived from authenticated user)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fee category created successfully',
    type: FeeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions (checked dynamically)',
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
  @RequireView(PermissionResource.FEE_CATEGORIES)
  @ApiOperation({
    summary: 'Get all fee categories (Dynamic Permissions)',
    description: 'Retrieves a paginated list of fee categories. Uses dynamic permissions instead of static roles.',
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
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions (checked dynamically)',
  })
  async findAll(@Query() query: QueryFeeCategoriesDto, @Req() req) {
    // If no school is specified in query, use the authenticated user's school
    if (!query.school && req.user.schoolId) {
      query.school = req.user.schoolId;
    }
    return await this.feeCategoryService.findAll(query);
  }

  @Get('school/:schoolId')
  @RequireView(PermissionResource.FEE_CATEGORIES)
  @ApiOperation({
    summary: 'Get fee categories by school (Dynamic Permissions)',
    description: 'Retrieves all active fee categories for a specific school. Uses dynamic permissions.',
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
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions (checked dynamically)',
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
  @RequireView(PermissionResource.FEE_CATEGORIES)
  @ApiOperation({
    summary: 'Get all active fee categories (Dynamic Permissions)',
    description: 'Retrieves all active fee categories across all schools. Uses dynamic permissions.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active fee categories retrieved successfully',
    type: [FeeCategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions (checked dynamically)',
  })
  async findActiveCategories(): Promise<FeeCategoryResponseDto[]> {
    const feeCategories = await this.feeCategoryService.findActiveCategories();
    return this.transformToResponseDtoArray(feeCategories);
  }

  @Get(':id')
  @RequireRead(PermissionResource.FEE_CATEGORIES)
  @ApiOperation({
    summary: 'Get a fee category by ID (Dynamic Permissions)',
    description: 'Retrieves a specific fee category by its unique identifier. Uses dynamic permissions.',
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
    status: HttpStatus.NOT_FOUND,
    description: 'Fee category not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions (checked dynamically)',
  })
  async findOne(@Param('id') id: string): Promise<FeeCategoryResponseDto> {
    const feeCategory = await this.feeCategoryService.findOne(id);
    return this.transformToResponseDto(feeCategory);
  }

  @Patch(':id')
  @RequireUpdate(PermissionResource.FEE_CATEGORIES)
  @ApiOperation({
    summary: 'Update a fee category (Dynamic Permissions)',
    description: 'Updates an existing fee category. Uses dynamic permissions instead of static roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fee category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: CreateFeeCategoryDto,
    description: 'Fee category update data (partial)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fee category updated successfully',
    type: FeeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fee category not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions (checked dynamically)',
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
  @RequireDelete(PermissionResource.FEE_CATEGORIES)
  @ApiOperation({
    summary: 'Delete a fee category (Dynamic Permissions)',
    description: 'Deletes a fee category. Uses dynamic permissions instead of static roles.',
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
    status: HttpStatus.NOT_FOUND,
    description: 'Fee category not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions (checked dynamically)',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.feeCategoryService.remove(id);
  }
}
