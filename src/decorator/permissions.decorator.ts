import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY, PermissionMetadata } from '../guard/permissions.guard';

export const RequirePermissions = (...permissions: PermissionMetadata[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Helper decorators for common permission patterns
export const RequireCreate = (resource: string) =>
  RequirePermissions({ resource, action: 'CREATE' });

export const RequireRead = (resource: string) =>
  RequirePermissions({ resource, action: 'READ' });

export const RequireUpdate = (resource: string) =>
  RequirePermissions({ resource, action: 'UPDATE' });

export const RequireDelete = (resource: string) =>
  RequirePermissions({ resource, action: 'DELETE' });

export const RequireView = (resource: string) =>
  RequirePermissions({ resource, action: 'VIEW' });
