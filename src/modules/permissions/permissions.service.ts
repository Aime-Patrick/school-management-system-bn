import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PermissionAction, PermissionResource } from '../../schemas/permission.schema';
import { UserPermission } from '../../schemas/user-permission.schema';
import { PermissionProfile } from '../../schemas/permission-profile.schema';
import { User } from '../../schemas/user.schema';
import { School } from '../../schemas/school.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateResourcePermissionsDto } from './dto/update-resource-permissions.dto';
import { BulkPermissionAssignmentDto } from './dto/bulk-permission-assignment.dto';
import { PermissionSetAssignmentDto } from './dto/permission-set-assignment.dto';
import { CopyPermissionsDto } from './dto/copy-permissions.dto';
import { BatchPermissionOperationsDto } from './dto/batch-permission-operations.dto';

// Predefined permission sets
const PERMISSION_SETS = {
  FEE_MANAGER: [
    { resource: PermissionResource.FEE_CATEGORIES, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.FEE_STRUCTURES, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.FEE_ASSIGNMENTS, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.PAYMENTS, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE] }
  ],
  
  STUDENT_VIEWER: [
    { resource: PermissionResource.STUDENTS, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.RESULTS, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.ASSIGNMENTS, actions: [PermissionAction.VIEW, PermissionAction.READ] }
  ],
  
  TEACHER_ASSISTANT: [
    { resource: PermissionResource.STUDENTS, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.ASSIGNMENTS, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE] },
    { resource: PermissionResource.RESULTS, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE] },
    { resource: PermissionResource.QUIZZES, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE] }
  ],

  LIBRARY_MANAGER: [
    { resource: PermissionResource.LIBRARY, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE] },
    { resource: PermissionResource.BOOKS, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE] },
    { resource: PermissionResource.BORROW_RECORDS, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE] },
    { resource: PermissionResource.MEMBERS, actions: [PermissionAction.VIEW, PermissionAction.READ] }
  ],

  ACCOUNTANT: [
    { resource: PermissionResource.PAYMENTS, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE] },
    { resource: PermissionResource.FEE_CATEGORIES, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.FEE_STRUCTURES, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.FEE_ASSIGNMENTS, actions: [PermissionAction.VIEW, PermissionAction.READ] },
    { resource: PermissionResource.FINANCIAL, actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE] },
    { resource: PermissionResource.REPORTS, actions: [PermissionAction.VIEW, PermissionAction.READ] }
  ]
};

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(UserPermission.name) private userPermissionModel: Model<UserPermission>,
    @InjectModel(PermissionProfile.name) private permissionProfileModel: Model<PermissionProfile>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(School.name) private schoolModel: Model<School>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = new this.permissionModel(createPermissionDto);
    return permission.save();
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.permissionModel
      .findByIdAndUpdate(id, updatePermissionDto, { new: true })
      .exec();
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Permission not found');
    }
  }

  async getPermissionsByRole(role: string): Promise<Record<string, string[]>> {
    const permissions = await this.permissionModel.find({
      roles: role,
      isActive: true,
    }).exec();

    const userPermissions: Record<string, string[]> = {};
    permissions.forEach(permission => {
      if (!userPermissions[permission.resource]) {
        userPermissions[permission.resource] = [];
      }
      userPermissions[permission.resource].push(permission.action);
    });

    return userPermissions;
  }

  async getPermissionsBySchool(schoolId: string): Promise<Record<string, Record<string, string[]>>> {
    const permissions = await this.permissionModel.find({
      $or: [
        { school: new Types.ObjectId(schoolId) },
        { school: { $exists: false } } // Global permissions
      ],
      isActive: true,
    }).exec();

    const formattedPermissions: Record<string, Record<string, string[]>> = {};
    permissions.forEach(permission => {
      if (!formattedPermissions[permission.resource]) {
        formattedPermissions[permission.resource] = {};
      }
      formattedPermissions[permission.resource][permission.action] = permission.roles;
    });

    return formattedPermissions;
  }

  async getAllPermissionsFormatted(): Promise<Record<string, Record<string, string[]>>> {
    const permissions = await this.permissionModel.find({ isActive: true }).exec();
    
    const formattedPermissions: Record<string, Record<string, string[]>> = {};
    permissions.forEach(permission => {
      if (!formattedPermissions[permission.resource]) {
        formattedPermissions[permission.resource] = {};
      }
      formattedPermissions[permission.resource][permission.action] = permission.roles;
    });
    
    return formattedPermissions;
  }

  async updateResourcePermissions(
    resource: string,
    updateDto: UpdateResourcePermissionsDto,
  ): Promise<void> {
    // Delete existing permissions for this resource
    await this.permissionModel.deleteMany({ resource });

    // Create new permissions
    const newPermissions: Partial<Permission>[] = [];
    Object.keys(updateDto.permissions).forEach(action => {
      newPermissions.push({
        resource,
        action,
        roles: updateDto.permissions[action],
        isActive: true,
      });
    });

    if (newPermissions.length > 0) {
      await this.permissionModel.insertMany(newPermissions);
    }
  }

  async checkPermission(
    userRole: string,
    resource: string,
    action: string,
    userSchoolId?: string,
    userId?: string,
  ): Promise<boolean> {
    // First check role-based permissions
    const roleHasPermission = await this.checkRolePermission(userRole, resource, action, userSchoolId);
    if (roleHasPermission) {
      return true;
    }

    // Then check user-specific permissions
    if (userId) {
      return await this.checkUserSpecificPermission(userId, resource, action, userSchoolId);
    }

    return false;
  }

  private async checkRolePermission(
    userRole: string,
    resource: string,
    action: string,
    userSchoolId?: string,
  ): Promise<boolean> {
    const query: any = {
      resource,
      action,
      roles: userRole,
      isActive: true,
    };

    // If user has a school, check for school-specific permissions or global permissions
    if (userSchoolId) {
      query.$or = [
        { school: new Types.ObjectId(userSchoolId) },
        { school: { $exists: false } }
      ];
    }

    const permission = await this.permissionModel.findOne(query).exec();
    return !!permission;
  }

  private async checkUserSpecificPermission(
    userId: string,
    resource: string,
    action: string,
    userSchoolId?: string,
  ): Promise<boolean> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      resource,
      action,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (userSchoolId) {
      query.schoolId = new Types.ObjectId(userSchoolId);
    }

    const userPermission = await this.userPermissionModel.findOne(query).exec();
    return !!userPermission;
  }

  // New methods for user-specific permissions

  async bulkAssignPermissions(
    assignmentDto: BulkPermissionAssignmentDto,
    grantedBy: string,
    schoolId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const { userIds, permissions, expiresAt, reason } = assignmentDto;
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    // Validate users belong to the school
    const users = await this.userModel.find({
      _id: { $in: userIds.map(id => new Types.ObjectId(id)) }
    }).exec();

    if (users.length !== userIds.length) {
      throw new BadRequestException('Some users not found');
    }

    // Check if users belong to the school (for non-system-admin users)
    const nonSystemUsers = users.filter(user => user.role !== 'system-admin');
    for (const user of nonSystemUsers) {
      if (user.school?.toString() !== schoolId) {
        throw new BadRequestException(`User ${user.username} does not belong to this school`);
      }
    }

    // Create user permissions
    const userPermissions: Partial<UserPermission>[] = [];
    
    for (const userId of userIds) {
      for (const permission of permissions) {
        for (const action of permission.actions) {
          userPermissions.push({
            userId: new Types.ObjectId(userId),
            schoolId: new Types.ObjectId(schoolId),
            resource: permission.resource,
            action,
            grantedBy: new Types.ObjectId(grantedBy),
            expiresAt,
            reason,
            isActive: true,
          });
        }
      }
    }

    try {
      await this.userPermissionModel.insertMany(userPermissions);
      success = userIds.length;
    } catch (error) {
      failed = userIds.length;
      errors.push(`Failed to assign permissions: ${error.message}`);
    }

    return { success, failed, errors };
  }

  async assignPermissionSet(
    assignmentDto: PermissionSetAssignmentDto,
    grantedBy: string,
    schoolId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const { userIds, permissionSet, expiresAt, reason } = assignmentDto;

    if (!PERMISSION_SETS[permissionSet]) {
      throw new BadRequestException(`Permission set '${permissionSet}' not found`);
    }

    const bulkAssignmentDto: BulkPermissionAssignmentDto = {
      userIds,
      permissions: PERMISSION_SETS[permissionSet],
      expiresAt,
      reason,
    };

    return this.bulkAssignPermissions(bulkAssignmentDto, grantedBy, schoolId);
  }

  async copyPermissionsFromUser(
    copyDto: CopyPermissionsDto,
    grantedBy: string,
    schoolId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const { sourceUserId, targetUserIds, includeExpiration, reason } = copyDto;

    // Get source user permissions
    const sourcePermissions = await this.userPermissionModel.find({
      userId: new Types.ObjectId(sourceUserId),
      schoolId: new Types.ObjectId(schoolId),
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).exec();

    if (sourcePermissions.length === 0) {
      throw new BadRequestException('Source user has no active permissions to copy');
    }

    // Create permissions for target users
    const userPermissions: Partial<UserPermission>[] = [];
    
    for (const targetUserId of targetUserIds) {
      for (const sourcePermission of sourcePermissions) {
        userPermissions.push({
          userId: new Types.ObjectId(targetUserId),
          schoolId: new Types.ObjectId(schoolId),
          resource: sourcePermission.resource,
          action: sourcePermission.action,
          grantedBy: new Types.ObjectId(grantedBy),
          expiresAt: includeExpiration ? sourcePermission.expiresAt : undefined,
          reason: reason || `Copied from user ${sourceUserId}`,
          isActive: true,
        });
      }
    }

    try {
      await this.userPermissionModel.insertMany(userPermissions);
      return { 
        success: targetUserIds.length, 
        failed: 0, 
        errors: [] 
      };
    } catch (error) {
      return { 
        success: 0, 
        failed: targetUserIds.length, 
        errors: [`Failed to copy permissions: ${error.message}`] 
      };
    }
  }

  async batchPermissionOperations(
    operationsDto: BatchPermissionOperationsDto,
    grantedBy: string,
    schoolId: string,
  ): Promise<{ results: Array<{ operation: string; success: number; failed: number; errors: string[] }> }> {
    const results: Array<{ operation: string; success: number; failed: number; errors: string[] }> = [];

    for (const operation of operationsDto.operations) {
      try {
        let result;
        
        switch (operation.type) {
          case 'grant':
            if (operation.permissionSet) {
              result = await this.assignPermissionSet({
                userIds: operation.userIds,
                permissionSet: operation.permissionSet,
                expiresAt: operation.expiresAt,
                reason: operation.reason,
              }, grantedBy, schoolId);
            } else if (operation.permissions) {
              result = await this.bulkAssignPermissions({
                userIds: operation.userIds,
                permissions: operation.permissions,
                expiresAt: operation.expiresAt,
                reason: operation.reason,
              }, grantedBy, schoolId);
            } else {
              throw new BadRequestException('Either permissionSet or permissions must be provided for grant operation');
            }
            break;

          case 'revoke':
            if (!operation.permissions) {
              throw new BadRequestException('Permissions must be provided for revoke operation');
            }
            result = await this.revokeUserPermissions(operation.userIds, operation.permissions, schoolId);
            break;

          case 'update':
            if (!operation.permissions) {
              throw new BadRequestException('Permissions must be provided for update operation');
            }
            if (!operation.expiresAt) {
              throw new BadRequestException('Expiration date must be provided for update operation');
            }
            result = await this.updateUserPermissions(operation.userIds, operation.permissions, operation.expiresAt, schoolId);
            break;

          default:
            throw new BadRequestException(`Unknown operation type: ${operation.type}`);
        }

        results.push({
          operation: operation.type,
          ...result,
        });
      } catch (error) {
        results.push({
          operation: operation.type,
          success: 0,
          failed: operation.userIds.length,
          errors: [error.message],
        });
      }
    }

    return { results };
  }

  async revokeUserPermissions(
    userIds: string[],
    permissions: { resource: PermissionResource; actions: PermissionAction[] }[],
    schoolId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    try {
      for (const userId of userIds) {
        for (const permission of permissions) {
          const result = await this.userPermissionModel.updateMany(
            {
              userId: new Types.ObjectId(userId),
              schoolId: new Types.ObjectId(schoolId),
              resource: permission.resource,
              action: { $in: permission.actions },
              isActive: true,
            },
            { isActive: false }
          );
          
          if (result.modifiedCount > 0) {
            success++;
          } else {
            failed++;
          }
        }
      }
    } catch (error) {
      failed = userIds.length;
      errors.push(`Failed to revoke permissions: ${error.message}`);
    }

    return { success, failed, errors };
  }

  async updateUserPermissions(
    userIds: string[],
    permissions: { resource: PermissionResource; actions: PermissionAction[] }[],
    expiresAt: Date,
    schoolId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    try {
      for (const userId of userIds) {
        for (const permission of permissions) {
          const result = await this.userPermissionModel.updateMany(
            {
              userId: new Types.ObjectId(userId),
              schoolId: new Types.ObjectId(schoolId),
              resource: permission.resource,
              action: { $in: permission.actions },
              isActive: true,
            },
            { expiresAt }
          );
          
          if (result.modifiedCount > 0) {
            success++;
          } else {
            failed++;
          }
        }
      }
    } catch (error) {
      failed = userIds.length;
      errors.push(`Failed to update permissions: ${error.message}`);
    }

    return { success, failed, errors };
  }

  async getUserPermissions(userId: string, schoolId?: string): Promise<{
    rolePermissions: Record<string, string[]>;
    userPermissions: Array<{
      resource: string;
      action: string;
      grantedBy: string;
      expiresAt?: Date;
      reason?: string;
    }>;
  }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get role-based permissions
    const rolePermissions = await this.getPermissionsByRole(user.role);

    // Only system-admin users can be school-less
    if (!schoolId) {
      if (user.role !== 'system-admin') {
        throw new BadRequestException(`User ${user.username} (${user.role}) must be associated with a school. This is a data integrity issue.`);
      }
      return {
        rolePermissions,
        userPermissions: [],
      };
    }

    // Get user-specific permissions
    const userPermissions = await this.userPermissionModel.find({
      userId: new Types.ObjectId(userId),
      schoolId: new Types.ObjectId(schoolId),
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).populate('grantedBy', 'username').exec();

    return {
      rolePermissions,
      userPermissions: userPermissions.map(up => ({
        resource: up.resource,
        action: up.action,
        grantedBy: (up.grantedBy as any).username,
        expiresAt: up.expiresAt,
        reason: up.reason,
      })),
    };
  }

  async getSchoolUsersWithPermissions(schoolId: string): Promise<Array<{
    user: { id: string; username: string; role: string };
    permissions: {
      rolePermissions: Record<string, string[]>;
      userPermissions: Array<{
        resource: string;
        action: string;
        grantedBy: string;
        expiresAt?: Date;
        reason?: string;
      }>;
    };
  }>> {
    const users = await this.userModel.find({
      $or: [
        { school: new Types.ObjectId(schoolId) },
        { role: 'school-admin' }
      ]
    }).exec();

    const usersWithPermissions: Array<{
      user: { id: string; username: string; role: string };
      permissions: {
        rolePermissions: Record<string, string[]>;
        userPermissions: Array<{
          resource: string;
          action: string;
          grantedBy: string;
          expiresAt?: Date;
          reason?: string;
        }>;
      };
    }> = [];

    for (const user of users) {
      const permissions = await this.getUserPermissions(user._id.toString(), schoolId);
      usersWithPermissions.push({
        user: {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        },
        permissions,
      });
    }

    return usersWithPermissions;
  }

  async getUserById(userId: string) {
    return this.userModel.findById(userId).exec();
  }

  async getSystemUsersWithPermissions(): Promise<Array<{
    user: { id: string; username: string; role: string; school?: string };
    permissions: {
      rolePermissions: Record<string, string[]>;
      userPermissions: Array<{
        resource: string;
        action: string;
        grantedBy: string;
        expiresAt?: Date;
        reason?: string;
      }>;
    };
  }>> {
    const users = await this.userModel.find({}).populate('school', 'name').exec();

    const usersWithPermissions: Array<{
      user: { id: string; username: string; role: string; school?: string };
      permissions: {
        rolePermissions: Record<string, string[]>;
        userPermissions: Array<{
          resource: string;
          action: string;
          grantedBy: string;
          expiresAt?: Date;
          reason?: string;
        }>;
      };
    }> = [];

    for (const user of users) {
      // For system-wide view, we need to get permissions for each user's school
      const schoolId = user.school?._id?.toString() || null;
      
      if (schoolId) {
        const permissions = await this.getUserPermissions(user._id.toString(), schoolId);
        usersWithPermissions.push({
          user: {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            school: (user.school as any)?.name || 'System Admin',
          },
          permissions,
        });
      } else {
        // For system admins without a school, just get role permissions
        const rolePermissions = await this.getPermissionsByRole(user.role);
        usersWithPermissions.push({
          user: {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            school: 'System Admin',
          },
          permissions: {
            rolePermissions,
            userPermissions: [],
          },
        });
      }
    }

    return usersWithPermissions;
  }

  async getAvailablePermissionSets(): Promise<Array<{
    name: string;
    description: string;
    permissions: Array<{ resource: string; actions: string[] }>;
  }>> {
    return Object.entries(PERMISSION_SETS).map(([name, permissions]) => ({
      name,
      description: this.getPermissionSetDescription(name),
      permissions: permissions.map(p => ({
        resource: p.resource,
        actions: p.actions,
      })),
    }));
  }

  // Data integrity check method for System Admins
  async getDataIntegrityIssues(): Promise<{
    usersWithoutSchool: Array<{ id: string; username: string; role: string; email?: string }>;
    orphanedPermissions: number;
    totalUsers: number;
    usersWithSchool: number;
    schoolAdminsWithoutSchool: number;
  }> {
    // Find users without school (except system-admin)
    const usersWithoutSchool = await this.userModel.find({
      $or: [
        { school: { $exists: false } },
        { school: null }
      ],
      role: { $ne: 'system-admin' }
    }).select('_id username role email').exec();

    // Get total counts for comparison
    const totalUsers = await this.userModel.countDocuments({ role: { $ne: 'system-admin' } });
    const usersWithSchool = await this.userModel.countDocuments({ 
      school: { $exists: true, $ne: null },
      role: { $ne: 'system-admin' }
    });

    // Count school admins without school (this is a critical issue!)
    const schoolAdminsWithoutSchool = await this.userModel.countDocuments({
      $or: [
        { school: { $exists: false } },
        { school: null }
      ],
      role: 'school-admin'
    });

    // Count orphaned permissions (permissions for non-existent users)
    const orphanedPermissions = await this.userPermissionModel.countDocuments({
      userId: { $exists: true }
    });

    return {
      usersWithoutSchool: usersWithoutSchool.map(user => ({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        email: user.email,
      })),
      orphanedPermissions,
      totalUsers,
      usersWithSchool,
      schoolAdminsWithoutSchool,
    };
  }

  // Fix data integrity issues by assigning users to schools
  async fixDataIntegrityIssues(assignments: Array<{ userId: string; schoolId: string }>): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const assignment of assignments) {
      try {
        const result = await this.userModel.updateOne(
          { _id: new Types.ObjectId(assignment.userId) },
          { school: new Types.ObjectId(assignment.schoolId) }
        );

        if (result.modifiedCount > 0) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`Failed to update user ${assignment.userId}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error updating user ${assignment.userId}: ${error.message}`);
      }
    }

    return results;
  }

  // Get available schools for assignment
  async getAvailableSchools(): Promise<Array<{ id: string; name: string }>> {
    const schools = await this.schoolModel.find({}).select('_id name').exec();
    return schools.map(school => ({
      id: school._id.toString(),
      name: (school as any).name,
    }));
  }

  // Find school admins without schools (critical issue)
  async getSchoolAdminsWithoutSchool(): Promise<Array<{ id: string; username: string; email?: string }>> {
    const schoolAdmins = await this.userModel.find({
      $or: [
        { school: { $exists: false } },
        { school: null }
      ],
      role: 'school-admin'
    }).select('_id username email').exec();

    return schoolAdmins.map(admin => ({
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
    }));
  }

  private getPermissionSetDescription(setName: string): string {
    const descriptions = {
      FEE_MANAGER: 'Can manage fee categories, structures, assignments and process payments',
      STUDENT_VIEWER: 'Can view student information, results and assignments',
      TEACHER_ASSISTANT: 'Can manage assignments, results and quizzes for students',
      LIBRARY_MANAGER: 'Can manage library books, borrow records and members',
      ACCOUNTANT: 'Can process payments, view financial data and generate reports',
    };
    return descriptions[setName] || 'Custom permission set';
  }

  async seedDefaultPermissions(): Promise<void> {
    const existingPermissions = await this.permissionModel.countDocuments();
    if (existingPermissions > 0) {
      return; // Already seeded
    }

    const defaultPermissions = [
      // Fee Categories
      { resource: PermissionResource.FEE_CATEGORIES, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_CATEGORIES, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_CATEGORIES, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_CATEGORIES, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher', 'student', 'accountant'] },
      
      // Fee Structures
      { resource: PermissionResource.FEE_STRUCTURES, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_STRUCTURES, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_STRUCTURES, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_STRUCTURES, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher', 'student', 'accountant'] },
      
      // Fee Assignments
      { resource: PermissionResource.FEE_ASSIGNMENTS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_ASSIGNMENTS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_ASSIGNMENTS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FEE_ASSIGNMENTS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher', 'student', 'accountant'] },
      
      // Payments
      { resource: PermissionResource.PAYMENTS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin', 'accountant'] },
      { resource: PermissionResource.PAYMENTS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin', 'accountant'] },
      { resource: PermissionResource.PAYMENTS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.PAYMENTS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher', 'student', 'accountant'] },
      
      // Students
      { resource: PermissionResource.STUDENTS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.STUDENTS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.STUDENTS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.STUDENTS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher'] },
      
      // Teachers
      { resource: PermissionResource.TEACHERS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.TEACHERS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.TEACHERS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.TEACHERS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher', 'student'] },
      
      // Parents
      { resource: PermissionResource.PARENTS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.PARENTS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.PARENTS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.PARENTS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher'] },
      
      // Library
      { resource: PermissionResource.LIBRARY, action: PermissionAction.CREATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.LIBRARY, action: PermissionAction.UPDATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.LIBRARY, action: PermissionAction.DELETE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.LIBRARY, action: PermissionAction.VIEW, roles: ['librarian', 'school-admin', 'system-admin', 'teacher', 'student'] },
      
      // Books
      { resource: PermissionResource.BOOKS, action: PermissionAction.CREATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.BOOKS, action: PermissionAction.UPDATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.BOOKS, action: PermissionAction.DELETE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.BOOKS, action: PermissionAction.VIEW, roles: ['librarian', 'school-admin', 'system-admin', 'teacher', 'student'] },
      
      // Borrow Records
      { resource: PermissionResource.BORROW_RECORDS, action: PermissionAction.CREATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.BORROW_RECORDS, action: PermissionAction.UPDATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.BORROW_RECORDS, action: PermissionAction.DELETE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.BORROW_RECORDS, action: PermissionAction.VIEW, roles: ['librarian', 'school-admin', 'system-admin', 'teacher', 'student'] },
      
      // Members
      { resource: PermissionResource.MEMBERS, action: PermissionAction.CREATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.MEMBERS, action: PermissionAction.UPDATE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.MEMBERS, action: PermissionAction.DELETE, roles: ['librarian', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.MEMBERS, action: PermissionAction.VIEW, roles: ['librarian', 'school-admin', 'system-admin', 'teacher'] },
      
      // Classes
      { resource: PermissionResource.CLASSES, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.CLASSES, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.CLASSES, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.CLASSES, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher'] },
      
      // Courses
      { resource: PermissionResource.COURSES, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.COURSES, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.COURSES, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.COURSES, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher', 'student'] },
      
      // Assignments
      { resource: PermissionResource.ASSIGNMENTS, action: PermissionAction.CREATE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.ASSIGNMENTS, action: PermissionAction.UPDATE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.ASSIGNMENTS, action: PermissionAction.DELETE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.ASSIGNMENTS, action: PermissionAction.VIEW, roles: ['teacher', 'school-admin', 'system-admin', 'student'] },
      
      // Results
      { resource: PermissionResource.RESULTS, action: PermissionAction.CREATE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.RESULTS, action: PermissionAction.UPDATE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.RESULTS, action: PermissionAction.DELETE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.RESULTS, action: PermissionAction.VIEW, roles: ['teacher', 'school-admin', 'system-admin', 'student'] },
      
      // Quizzes
      { resource: PermissionResource.QUIZZES, action: PermissionAction.CREATE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.QUIZZES, action: PermissionAction.UPDATE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.QUIZZES, action: PermissionAction.DELETE, roles: ['teacher', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.QUIZZES, action: PermissionAction.VIEW, roles: ['teacher', 'school-admin', 'system-admin', 'student'] },
      
      // Events
      { resource: PermissionResource.EVENTS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.EVENTS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.EVENTS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.EVENTS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher', 'student'] },
      
      // Academic Years
      { resource: PermissionResource.ACADEMIC_YEARS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.ACADEMIC_YEARS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.ACADEMIC_YEARS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.ACADEMIC_YEARS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher'] },
      
      // Terms
      { resource: PermissionResource.TERMS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.TERMS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.TERMS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.TERMS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'teacher'] },
      
      // Users
      { resource: PermissionResource.USERS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.USERS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.USERS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.USERS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin'] },
      
      // Schools
      { resource: PermissionResource.SCHOOLS, action: PermissionAction.CREATE, roles: ['system-admin', 'school-admin'] },
      { resource: PermissionResource.SCHOOLS, action: PermissionAction.UPDATE, roles: ['system-admin', 'school-admin'] },
      { resource: PermissionResource.SCHOOLS, action: PermissionAction.DELETE, roles: ['system-admin'] },
      { resource: PermissionResource.SCHOOLS, action: PermissionAction.VIEW, roles: ['system-admin', 'school-admin'] },
      
      // Financial
      { resource: PermissionResource.FINANCIAL, action: PermissionAction.CREATE, roles: ['accountant', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.FINANCIAL, action: PermissionAction.UPDATE, roles: ['accountant', 'school-admin', 'system-admin'] },
      { resource: PermissionResource.FINANCIAL, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.FINANCIAL, action: PermissionAction.VIEW, roles: ['accountant', 'school-admin', 'system-admin'] },
      
      // Reports
      { resource: PermissionResource.REPORTS, action: PermissionAction.CREATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.REPORTS, action: PermissionAction.UPDATE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.REPORTS, action: PermissionAction.DELETE, roles: ['school-admin', 'system-admin'] },
      { resource: PermissionResource.REPORTS, action: PermissionAction.VIEW, roles: ['school-admin', 'system-admin', 'accountant'] },
    ];

    await this.permissionModel.insertMany(defaultPermissions);
  }
}
