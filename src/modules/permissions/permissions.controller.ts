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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateResourcePermissionsDto } from './dto/update-resource-permissions.dto';
import { BulkPermissionAssignmentDto } from './dto/bulk-permission-assignment.dto';
import { PermissionSetAssignmentDto } from './dto/permission-set-assignment.dto';
import { CopyPermissionsDto } from './dto/copy-permissions.dto';
import { BatchPermissionOperationsDto } from './dto/batch-permission-operations.dto';
import { JwtAuthGuard } from '../../guard/jwt-auth.guard';
import { RolesGuard } from '../../guard/roles.guard';
import { Roles } from '../../decorator/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { PermissionResource, PermissionAction } from '../../schemas/permission.schema';

@ApiTags('Permissions Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permission created successfully',
  })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions retrieved successfully',
  })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('formatted')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all permissions in formatted structure' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Formatted permissions retrieved successfully',
  })
  getAllFormatted() {
    return this.permissionsService.getAllPermissionsFormatted();
  }

  @Get('role/:role')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get permissions by role' })
  @ApiParam({
    name: 'role',
    description: 'User role to get permissions for',
    example: 'teacher',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role permissions retrieved successfully',
  })
  getPermissionsByRole(@Param('role') role: string) {
    return this.permissionsService.getPermissionsByRole(role);
  }

  @Get('school/:schoolId')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get permissions by school' })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'School permissions retrieved successfully',
  })
  getPermissionsBySchool(@Param('schoolId') schoolId: string) {
    return this.permissionsService.getPermissionsBySchool(schoolId);
  }

  @Get('my-permissions')
  @ApiOperation({
    summary: 'Get current user permissions',
    description: 'Retrieves all permissions for the currently authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User permissions retrieved successfully',
  })
  async getMyPermissions(@Req() req) {
    const user = req.user;
    if (!user.schoolId) {
      throw new BadRequestException('User must be associated with a school');
    }
    return this.permissionsService.getPermissionsByRole(user.role);
  }

  @Get('check/:resource/:action')
  @ApiOperation({
    summary: 'Check user permission',
    description: 'Checks if the current user has a specific permission for a resource and action.',
  })
  @ApiParam({
    name: 'resource',
    description: 'Resource to check permission for',
    example: 'FEE_CATEGORIES',
  })
  @ApiParam({
    name: 'action',
    description: 'Action to check permission for',
    example: 'CREATE',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission check result',
    schema: {
      type: 'object',
      properties: {
        hasPermission: { type: 'boolean', example: true },
        userRole: { type: 'string', example: 'school-admin' },
        resource: { type: 'string', example: 'FEE_CATEGORIES' },
        action: { type: 'string', example: 'CREATE' },
      },
    },
  })
  async checkPermission(
    @Param('resource') resource: string,
    @Param('action') action: string,
    @Req() req,
  ) {
    const user = req.user;
    const hasPermission = await this.permissionsService.checkPermission(
      user.role,
      resource,
      action,
      user.schoolId,
      user.id,
    );

    return {
      hasPermission,
      userRole: user.role,
      resource,
      action,
    };
  }

  // User-specific permission endpoints (must come before :id route)

  @Post('bulk-assign')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Bulk assign permissions to users',
    description: 'Assign multiple permissions to multiple users at once',
  })
  @ApiBody({ type: BulkPermissionAssignmentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permissions assigned successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', example: 5 },
        failed: { type: 'number', example: 0 },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async bulkAssignPermissions(
    @Body() assignmentDto: BulkPermissionAssignmentDto,
    @Req() req,
  ) {
    const user = req.user;
    
    // For System Admins, we need to determine schoolId from the users being assigned
    let schoolId = user.schoolId;
    
    if (!schoolId && user.role === UserRole.SYSTEM_ADMIN) {
      // For System Admins, get schoolId from the first user in the list
      if (assignmentDto.userIds && assignmentDto.userIds.length > 0) {
        const firstUser = await this.permissionsService.getUserById(assignmentDto.userIds[0]);
        schoolId = firstUser?.school?.toString();
      }
      
      if (!schoolId) {
        throw new BadRequestException('Unable to determine school context for bulk assignment');
      }
    } else if (!schoolId) {
      throw new BadRequestException('User must be associated with a school');
    }
    
    return this.permissionsService.bulkAssignPermissions(
      assignmentDto,
      user.id,
      schoolId,
    );
  }

  @Post('assign-set')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Assign permission set to users',
    description: 'Assign a predefined permission set to multiple users',
  })
  @ApiBody({ type: PermissionSetAssignmentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permission set assigned successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', example: 3 },
        failed: { type: 'number', example: 0 },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async assignPermissionSet(
    @Body() assignmentDto: PermissionSetAssignmentDto,
    @Req() req,
  ) {
    const user = req.user;
    
    // For System Admins, we need to determine schoolId from the users being assigned
    let schoolId = user.schoolId;
    
    if (!schoolId && user.role === UserRole.SYSTEM_ADMIN) {
      // For System Admins, get schoolId from the first user in the list
      if (assignmentDto.userIds && assignmentDto.userIds.length > 0) {
        const firstUser = await this.permissionsService.getUserById(assignmentDto.userIds[0]);
        schoolId = firstUser?.school?.toString();
      }
      
      if (!schoolId) {
        throw new BadRequestException('Unable to determine school context for permission set assignment');
      }
    } else if (!schoolId) {
      throw new BadRequestException('User must be associated with a school');
    }
    
    return this.permissionsService.assignPermissionSet(
      assignmentDto,
      user.id,
      schoolId,
    );
  }

  @Post('copy-from-user')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Copy permissions from one user to others',
    description: 'Copy all permissions from a source user to multiple target users',
  })
  @ApiBody({ type: CopyPermissionsDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permissions copied successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', example: 2 },
        failed: { type: 'number', example: 0 },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async copyPermissionsFromUser(
    @Body() copyDto: CopyPermissionsDto,
    @Req() req,
  ) {
    const user = req.user;
    
    // For System Admins, we need to determine schoolId from the source user
    let schoolId = user.schoolId;
    
    if (!schoolId && user.role === UserRole.SYSTEM_ADMIN) {
      // For System Admins, get schoolId from the source user
      if (copyDto.sourceUserId) {
        const sourceUser = await this.permissionsService.getUserById(copyDto.sourceUserId);
        schoolId = sourceUser?.school?.toString();
      }
      
      if (!schoolId) {
        throw new BadRequestException('Unable to determine school context for copying permissions');
      }
    } else if (!schoolId) {
      throw new BadRequestException('User must be associated with a school');
    }
    
    return this.permissionsService.copyPermissionsFromUser(
      copyDto,
      user.id,
      schoolId,
    );
  }

  @Post('batch-operations')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Perform batch permission operations',
    description: 'Perform multiple permission operations (grant, revoke, update) in a single request',
  })
  @ApiBody({ type: BatchPermissionOperationsDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Batch operations completed successfully',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              operation: { type: 'string', example: 'grant' },
              success: { type: 'number', example: 3 },
              failed: { type: 'number', example: 0 },
              errors: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  async batchPermissionOperations(
    @Body() operationsDto: BatchPermissionOperationsDto,
    @Req() req,
  ) {
    const user = req.user;
    if (!user.schoolId) {
      throw new BadRequestException('User must be associated with a school');
    }
    return this.permissionsService.batchPermissionOperations(
      operationsDto,
      user.id,
      user.schoolId,
    );
  }

  @Get('user/:userId')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Get user permissions',
    description: 'Get both role-based and user-specific permissions for a user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        rolePermissions: {
          type: 'object',
          additionalProperties: { type: 'array', items: { type: 'string' } },
        },
        userPermissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              resource: { type: 'string', example: 'FEE_CATEGORIES' },
              action: { type: 'string', example: 'VIEW' },
              grantedBy: { type: 'string', example: 'admin_user' },
              expiresAt: { type: 'string', format: 'date-time' },
              reason: { type: 'string', example: 'Temporary access for fee management' },
            },
          },
        },
      },
    },
  })
  async getUserPermissions(@Param('userId') userId: string, @Req() req) {
    const user = req.user;
    
    // For System Admins, we need to determine schoolId from the target user
    let schoolId = user.schoolId;
    
    if (!schoolId && user.role === UserRole.SYSTEM_ADMIN) {
      // For System Admins, get schoolId from the target user
      const targetUser = await this.permissionsService.getUserById(userId);
      
      if (!targetUser) {
        throw new BadRequestException('User not found');
      }
      
      // Only system-admin users should be school-less
      if (targetUser.role === UserRole.SYSTEM_ADMIN) {
        const rolePermissions = await this.permissionsService.getPermissionsByRole(targetUser.role);
        return {
          rolePermissions,
          userPermissions: [],
        };
      }
      
      schoolId = targetUser?.school?.toString();
      
      if (!schoolId) {
        throw new BadRequestException(`User ${targetUser.username} (${targetUser.role}) must be associated with a school. Please contact your system administrator to fix this data integrity issue.`);
      }
    } else if (!schoolId) {
      throw new BadRequestException('User must be associated with a school');
    }
    
    return this.permissionsService.getUserPermissions(userId, schoolId);
  }

  @Get('school/:schoolId/users-with-permissions')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Get all users with their permissions',
    description: 'Get all users in a school with their role-based and user-specific permissions',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users with permissions retrieved successfully',
  })
  async getSchoolUsersWithPermissions(@Param('schoolId') schoolId: string, @Req() req) {
    const user = req.user;
    if (user.schoolId !== schoolId) {
      throw new BadRequestException('You can only view users from your own school');
    }
    return this.permissionsService.getSchoolUsersWithPermissions(schoolId);
  }

  @Get('system/users-with-permissions')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get all users across all schools with their permissions',
    description: 'System admin endpoint to get all users in the system with their role-based and user-specific permissions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All users with permissions retrieved successfully',
  })
  async getSystemUsersWithPermissions(@Req() req) {
    const user = req.user;
    if (user.role !== UserRole.SYSTEM_ADMIN) {
      throw new BadRequestException('Only system admins can access this endpoint');
    }
    return this.permissionsService.getSystemUsersWithPermissions();
  }

  @Get('data-integrity')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Check data integrity issues',
    description: 'Find users without schools and other data integrity issues',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data integrity issues retrieved successfully',
  })
  async getDataIntegrityIssues() {
    return this.permissionsService.getDataIntegrityIssues();
  }

  @Post('fix-data-integrity')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Fix data integrity issues',
    description: 'Assign users to schools to fix data integrity issues',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        assignments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
              schoolId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data integrity issues fixed successfully',
  })
  async fixDataIntegrityIssues(@Body() body: { assignments: Array<{ userId: string; schoolId: string }> }) {
    return this.permissionsService.fixDataIntegrityIssues(body.assignments);
  }

  @Get('available-schools')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get available schools',
    description: 'Get list of all schools for assignment',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available schools retrieved successfully',
  })
  async getAvailableSchools() {
    return this.permissionsService.getAvailableSchools();
  }

  @Get('school-admins-without-school')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get school admins without school',
    description: 'Get list of school admins who are not assigned to any school',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'School admins without school retrieved successfully',
  })
  async getSchoolAdminsWithoutSchool() {
    return this.permissionsService.getSchoolAdminsWithoutSchool();
  }

  @Get('available-sets')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Get available permission sets',
    description: 'Get all predefined permission sets that can be assigned to users',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available permission sets retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'FEE_MANAGER' },
          description: { type: 'string', example: 'Can manage fee categories, structures, assignments and process payments' },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                resource: { type: 'string', example: 'FEE_CATEGORIES' },
                actions: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  })
  async getAvailablePermissionSets() {
    return this.permissionsService.getAvailablePermissionSets();
  }

  @Delete('user/:userId/revoke')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Revoke user permissions',
    description: 'Revoke specific permissions from a user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              resource: { type: 'string', example: 'FEE_CATEGORIES' },
              actions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions revoked successfully',
  })
  async revokeUserPermissions(
    @Param('userId') userId: string,
    @Body() body: { permissions: Array<{ resource: PermissionResource; actions: PermissionAction[] }> },
    @Req() req,
  ) {
    const user = req.user;
    
    // For System Admins, we need to determine schoolId from the target user
    let schoolId = user.schoolId;
    
    if (!schoolId && user.role === UserRole.SYSTEM_ADMIN) {
      // For System Admins, get schoolId from the target user
      const targetUser = await this.permissionsService.getUserById(userId);
      schoolId = targetUser?.school?.toString();
      
      if (!schoolId) {
        throw new BadRequestException('Unable to determine school context for revoking permissions');
      }
    } else if (!schoolId) {
      throw new BadRequestException('User must be associated with a school');
    }
    
    return this.permissionsService.revokeUserPermissions(
      [userId],
      body.permissions,
      schoolId,
    );
  }

  // Standard CRUD endpoints (must come after specific routes)

  @Get(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission retrieved successfully',
  })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission updated successfully',
  })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }

  @Post('resource/:resource')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update permissions for a specific resource' })
  @ApiParam({
    name: 'resource',
    description: 'Resource name',
    example: 'FEE_CATEGORIES',
  })
  @ApiBody({ type: UpdateResourcePermissionsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource permissions updated successfully',
  })
  updateResourcePermissions(
    @Param('resource') resource: string,
    @Body() updateDto: UpdateResourcePermissionsDto,
  ) {
    return this.permissionsService.updateResourcePermissions(resource, updateDto);
  }
}
