# Dynamic Permissions System

This document explains the new dynamic permissions system implemented in the school management backend. This system replaces the static role-based authorization with a flexible, database-driven permissions system.

## Overview

The dynamic permissions system allows you to:
- Define permissions at the resource and action level
- Assign multiple roles to each permission
- Set school-specific permissions
- Modify permissions without code changes
- Check permissions dynamically at runtime

## Architecture

### Core Components

1. **Permission Schema** (`src/schemas/permission.schema.ts`)
   - Defines the structure for storing permissions
   - Includes resource, action, roles, conditions, and school-specific settings

2. **Permissions Service** (`src/modules/permissions/permissions.service.ts`)
   - Handles all permission-related business logic
   - Provides methods for checking, creating, and managing permissions

3. **Permissions Controller** (`src/modules/permissions/permissions.controller.ts`)
   - Exposes REST API endpoints for managing permissions
   - Allows admins to view and modify permissions

4. **Permissions Guard** (`src/guard/permissions.guard.ts`)
   - Intercepts requests and checks permissions dynamically
   - Replaces the static RolesGuard for endpoints using dynamic permissions

5. **Permission Decorators** (`src/decorator/permissions.decorator.ts`)
   - Provides decorators for specifying required permissions on endpoints

## Permission Structure

### Resources
Resources represent the main entities in the system:
- `FEE_CATEGORIES` - Fee category management
- `FEE_STRUCTURES` - Fee structure management
- `FEE_ASSIGNMENTS` - Fee assignment management
- `PAYMENTS` - Payment processing
- `STUDENTS` - Student management
- `TEACHERS` - Teacher management
- `PARENTS` - Parent management
- `LIBRARY` - Library management
- `BOOKS` - Book management
- `BORROW_RECORDS` - Borrow record management
- `MEMBERS` - Library member management
- `CLASSES` - Class management
- `COURSES` - Course management
- `ASSIGNMENTS` - Assignment management
- `RESULTS` - Result management
- `QUIZZES` - Quiz management
- `EVENTS` - Event management
- `ACADEMIC_YEARS` - Academic year management
- `TERMS` - Term management
- `USERS` - User management
- `SCHOOLS` - School management
- `FINANCIAL` - Financial management
- `REPORTS` - Report generation

### Actions
Actions represent the operations that can be performed:
- `CREATE` - Create new resources
- `READ` - Read specific resources
- `UPDATE` - Update existing resources
- `DELETE` - Delete resources
- `VIEW` - View/list resources

### Roles
Roles are defined in the User schema:
- `system-admin` - System administrator
- `school-admin` - School administrator
- `teacher` - Teacher
- `student` - Student
- `parent` - Parent
- `accountant` - Accountant
- `librarian` - Librarian

## Usage

### 1. Basic Permission Check

Instead of using static roles:
```typescript
// Old way (static roles)
@Roles(UserRole.SCHOOL_ADMIN, UserRole.SYSTEM_ADMIN)
@Post()
create() { ... }
```

Use dynamic permissions:
```typescript
// New way (dynamic permissions)
@RequireCreate(PermissionResource.FEE_CATEGORIES)
@Post()
create() { ... }
```

### 2. Multiple Permissions

You can require multiple permissions for a single endpoint:
```typescript
@RequirePermissions(
  { resource: PermissionResource.FEE_CATEGORIES, action: PermissionAction.CREATE },
  { resource: PermissionResource.FEE_STRUCTURES, action: PermissionAction.VIEW }
)
@Post()
create() { ... }
```

### 3. Using the Permissions Guard

Replace the RolesGuard with PermissionsGuard:
```typescript
// Old way
@UseGuards(JwtAuthGuard, RolesGuard)

// New way
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

### 4. Available Decorators

- `@RequireCreate(resource)` - Requires CREATE permission
- `@RequireRead(resource)` - Requires READ permission
- `@RequireUpdate(resource)` - Requires UPDATE permission
- `@RequireDelete(resource)` - Requires DELETE permission
- `@RequireView(resource)` - Requires VIEW permission
- `@RequirePermissions(...permissions)` - Requires multiple specific permissions

## API Endpoints

### Permission Management

#### Get All Permissions
```http
GET /api/permissions
Authorization: Bearer <token>
```

#### Get Permissions by Role
```http
GET /api/permissions/role/:role
Authorization: Bearer <token>
```

#### Get Permissions by School
```http
GET /api/permissions/school/:schoolId
Authorization: Bearer <token>
```

#### Get My Permissions
```http
GET /api/permissions/my-permissions
Authorization: Bearer <token>
```

#### Check Specific Permission
```http
GET /api/permissions/check?resource=FEE_CATEGORIES&action=CREATE
Authorization: Bearer <token>
```

#### Create New Permission
```http
POST /api/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "resource": "FEE_CATEGORIES",
  "action": "CREATE",
  "roles": ["school-admin", "system-admin"],
  "conditions": {
    "schoolId": "507f1f77bcf86cd799439011"
  }
}
```

#### Update Resource Permissions
```http
PATCH /api/permissions/resource/FEE_CATEGORIES
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": {
    "CREATE": ["school-admin", "system-admin"],
    "UPDATE": ["school-admin", "system-admin"],
    "DELETE": ["school-admin", "system-admin"],
    "VIEW": ["school-admin", "system-admin", "teacher", "student"]
  }
}
```

#### Seed Default Permissions
```http
POST /api/permissions/seed
Authorization: Bearer <token>
```

## Default Permissions

The system comes with a comprehensive set of default permissions that are automatically seeded when the system starts. These include:

### Fee Management
- **Fee Categories**: School admins and system admins can create/update/delete, all roles can view
- **Fee Structures**: School admins and system admins can create/update/delete, all roles can view
- **Fee Assignments**: School admins and system admins can create/update/delete, all roles can view
- **Payments**: Accountants, school admins, and system admins can create/update, only admins can delete, all roles can view

### Academic Management
- **Students**: School admins and system admins can create/update/delete, teachers can view
- **Teachers**: School admins and system admins can create/update/delete, all roles can view
- **Classes**: School admins and system admins can create/update/delete, teachers and students can view
- **Courses**: School admins and system admins can create/update/delete, teachers and students can view
- **Assignments**: Teachers, school admins, and system admins can create/update/delete, students can view
- **Results**: Teachers, school admins, and system admins can create/update/delete, students can view
- **Quizzes**: Teachers, school admins, and system admins can create/update/delete, students can view

### Library Management
- **Books**: Librarians, school admins, and system admins can create/update/delete, all roles can view
- **Borrow Records**: Librarians, school admins, and system admins can create/update/delete, all roles can view
- **Members**: Librarians, school admins, and system admins can create/update/delete, all roles can view

### System Management
- **Users**: School admins and system admins can create/update/delete/view
- **Schools**: Only system admins can create/update/delete, school admins can view
- **Events**: School admins and system admins can create/update/delete, all roles can view
- **Reports**: School admins, system admins, accountants, and teachers can view

## Migration Guide

### From Static Roles to Dynamic Permissions

1. **Update Guards**: Replace `RolesGuard` with `PermissionsGuard`
2. **Update Decorators**: Replace `@Roles()` with permission decorators
3. **Update Imports**: Import new permission decorators and enums
4. **Test Permissions**: Verify that permissions work as expected

### Example Migration

**Before (Static Roles):**
```typescript
import { RolesGuard } from '../../guard/roles.guard';
import { Roles } from '../../decorator/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees/categories')
export class FeeCategoryController {
  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.SYSTEM_ADMIN)
  create() { ... }

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.TEACHER)
  findAll() { ... }
}
```

**After (Dynamic Permissions):**
```typescript
import { PermissionsGuard } from '../../guard/permissions.guard';
import { RequireCreate, RequireView } from '../../decorator/permissions.decorator';
import { PermissionResource } from '../../schemas/permission.schema';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fees/categories')
export class FeeCategoryController {
  @Post()
  @RequireCreate(PermissionResource.FEE_CATEGORIES)
  create() { ... }

  @Get()
  @RequireView(PermissionResource.FEE_CATEGORIES)
  findAll() { ... }
}
```

## Benefits

1. **Flexibility**: Permissions can be modified without code changes
2. **Granularity**: Fine-grained control over what each role can do
3. **Scalability**: Easy to add new resources and actions
4. **Maintainability**: Centralized permission management
5. **Auditability**: Clear tracking of who can do what
6. **School-Specific**: Support for school-specific permissions

## Security Considerations

1. **Permission Validation**: Always validate permissions on both client and server side
2. **Role Hierarchy**: Consider implementing role hierarchy for complex permission scenarios
3. **Audit Logging**: Log permission changes for security auditing
4. **Caching**: Consider caching permissions for performance (with proper invalidation)
5. **Default Deny**: The system follows a "default deny" approach - permissions must be explicitly granted

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check if the user's role has the required permission
   - Verify the permission exists in the database
   - Check if school-specific permissions are properly configured

2. **Performance Issues**
   - Consider implementing permission caching
   - Optimize database queries for permission checks
   - Use database indexes for permission lookups

3. **Permission Not Found**
   - Ensure default permissions are seeded
   - Check if the resource and action enums are correctly defined
   - Verify the permission is active in the database

### Debugging

Use the permission check endpoint to debug permission issues:
```http
GET /api/permissions/check?resource=FEE_CATEGORIES&action=CREATE
```

This will return:
```json
{
  "hasPermission": true
}
```

## Future Enhancements

1. **Permission Groups**: Group related permissions for easier management
2. **Conditional Permissions**: More complex conditions based on data
3. **Permission Templates**: Predefined permission sets for common scenarios
4. **Permission Analytics**: Track permission usage and effectiveness
5. **Role Hierarchy**: Implement role inheritance and hierarchy
6. **Permission Workflows**: Approval workflows for permission changes
