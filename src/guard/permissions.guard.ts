import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../modules/permissions/permissions.service';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionMetadata {
  resource: string;
  action: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<PermissionMetadata[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // If no permissions are required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionsService.checkPermission(
        user.role,
        permission.resource,
        permission.action,
        user.schoolId,
        user.id,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Forbidden. You do not have ${permission.action} permission on ${permission.resource}.`,
        );
      }
    }

    return true;
  }
}
