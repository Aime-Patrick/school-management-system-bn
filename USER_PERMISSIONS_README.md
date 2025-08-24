# User-Specific Permissions System

This document explains the enhanced permissions system that allows school administrators to grant specific permissions to individual users beyond their default role-based permissions.

## Overview

The user-specific permissions system extends the existing role-based permissions by allowing school admins to:

- **Grant individual permissions** to specific users
- **Assign permission sets** (predefined groups of permissions)
- **Copy permissions** from one user to others
- **Perform batch operations** for multiple users
- **Set expiration dates** for temporary access
- **Track permission history** with audit trails

## Key Features

### 1. **Bulk Permission Assignment**
Assign multiple permissions to multiple users in a single operation:

```typescript
POST /permissions/bulk-assign
{
  "userIds": ["user1", "user2", "user3"],
  "permissions": [
    {
      "resource": "FEE_CATEGORIES",
      "actions": ["VIEW", "READ"]
    },
    {
      "resource": "PAYMENTS", 
      "actions": ["VIEW", "CREATE"]
    }
  ],
  "expiresAt": "2024-12-31T23:59:59.000Z", // optional
  "reason": "Temporary fee management access" // optional
}
```

### 2. **Permission Sets**
Use predefined permission sets for common scenarios:

```typescript
POST /permissions/assign-set
{
  "userIds": ["user1", "user2"],
  "permissionSet": "FEE_MANAGER",
  "expiresAt": "2024-12-31T23:59:59.000Z", // optional
  "reason": "Fee management role assignment" // optional
}
```

**Available Permission Sets:**
- `FEE_MANAGER` - Can manage fee categories, structures, assignments and process payments
- `STUDENT_VIEWER` - Can view student information, results and assignments
- `TEACHER_ASSISTANT` - Can manage assignments, results and quizzes for students
- `LIBRARY_MANAGER` - Can manage library books, borrow records and members
- `ACCOUNTANT` - Can process payments, view financial data and generate reports

### 3. **Copy Permissions**
Copy all permissions from one user to others:

```typescript
POST /permissions/copy-from-user
{
  "sourceUserId": "user_with_permissions",
  "targetUserIds": ["user1", "user2", "user3"],
  "includeExpiration": true, // whether to copy expiration dates
  "reason": "Copying permissions from experienced user" // optional
}
```

### 4. **Batch Operations**
Perform multiple operations in a single request:

```typescript
POST /permissions/batch-operations
{
  "operations": [
    {
      "type": "grant",
      "userIds": ["user1", "user2"],
      "permissionSet": "FEE_MANAGER"
    },
    {
      "type": "revoke", 
      "userIds": ["user3"],
      "permissions": [
        { "resource": "PAYMENTS", "actions": ["CREATE"] }
      ]
    },
    {
      "type": "update",
      "userIds": ["user4"],
      "permissions": [
        { "resource": "FEE_CATEGORIES", "actions": ["VIEW"] }
      ],
      "expiresAt": "2024-06-30T23:59:59.000Z"
    }
  ]
}
```

## API Endpoints

### Permission Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/permissions/bulk-assign` | Assign multiple permissions to users | School Admin |
| POST | `/permissions/assign-set` | Assign permission set to users | School Admin |
| POST | `/permissions/copy-from-user` | Copy permissions from one user to others | School Admin |
| POST | `/permissions/batch-operations` | Perform batch permission operations | School Admin |
| DELETE | `/permissions/user/:userId/revoke` | Revoke specific permissions from user | School Admin |

### Permission Queries

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/permissions/user/:userId` | Get user's permissions (role + user-specific) | School Admin |
| GET | `/permissions/school/:schoolId/users-with-permissions` | Get all users with their permissions | School Admin |
| GET | `/permissions/available-sets` | Get available permission sets | School Admin |
| GET | `/permissions/check/:resource/:action` | Check if current user has permission | All Users |

## Permission Checking Logic

The system checks permissions in the following order:

1. **Role-based permissions** - Check if user's role has the permission
2. **User-specific permissions** - Check if user has been granted individual permissions
3. **Expiration check** - Ensure permissions haven't expired
4. **School isolation** - Ensure users can only access their own school's data

## Database Schema

### UserPermission Schema
```typescript
{
  userId: ObjectId,        // User who has the permission
  schoolId: ObjectId,      // School context
  resource: string,        // Resource (e.g., FEE_CATEGORIES)
  action: string,          // Action (e.g., VIEW, CREATE)
  grantedBy: ObjectId,     // Who granted the permission
  expiresAt?: Date,        // Optional expiration
  reason?: string,         // Optional reason
  isActive: boolean,       // Whether permission is active
  createdAt: Date,         // When permission was granted
  updatedAt: Date          // When permission was last updated
}
```

### PermissionProfile Schema
```typescript
{
  name: string,            // Profile name (e.g., "FEE_MANAGER")
  description?: string,    // Profile description
  schoolId: ObjectId,      // School context
  createdBy: ObjectId,     // Who created the profile
  permissions: [           // Array of permissions
    {
      resource: string,
      actions: string[]
    }
  ],
  isActive: boolean,       // Whether profile is active
  isDefault: boolean       // Whether this is a system default
}
```

## Security Considerations

### 1. **School Isolation**
- School admins can only manage permissions within their own school
- Users can only access data from their own school
- System admins can access all schools

### 2. **Permission Limits**
- School admins cannot grant system-admin level permissions
- Users cannot grant permissions to themselves
- Expired permissions are automatically deactivated

### 3. **Audit Trail**
- All permission grants are tracked with `grantedBy` field
- Permission history is maintained with timestamps
- Reasons can be provided for permission grants

### 4. **Validation**
- Users must exist and belong to the school
- Permission resources and actions must be valid
- Expiration dates must be in the future

## Usage Examples

### Example 1: Grant Fee Management Access
```typescript
// Grant fee management permissions to a teacher
POST /permissions/assign-set
{
  "userIds": ["teacher123"],
  "permissionSet": "FEE_MANAGER",
  "expiresAt": "2024-06-30T23:59:59.000Z",
  "reason": "Temporary fee management during accountant absence"
}
```

### Example 2: Bulk Student Viewer Access
```typescript
// Grant student viewing permissions to multiple teachers
POST /permissions/bulk-assign
{
  "userIds": ["teacher1", "teacher2", "teacher3"],
  "permissions": [
    {
      "resource": "STUDENTS",
      "actions": ["VIEW", "READ"]
    },
    {
      "resource": "RESULTS",
      "actions": ["VIEW", "READ"]
    }
  ],
  "reason": "End-of-term result review access"
}
```

### Example 3: Copy Permissions from Experienced User
```typescript
// Copy permissions from an experienced teacher to new teachers
POST /permissions/copy-from-user
{
  "sourceUserId": "experienced_teacher",
  "targetUserIds": ["new_teacher1", "new_teacher2"],
  "includeExpiration": false,
  "reason": "Onboarding new teachers with standard permissions"
}
```

### Example 4: Batch Operations for Role Changes
```typescript
// Revoke old permissions and grant new ones
POST /permissions/batch-operations
{
  "operations": [
    {
      "type": "revoke",
      "userIds": ["user123"],
      "permissions": [
        { "resource": "FEE_CATEGORIES", "actions": ["CREATE", "UPDATE"] }
      ]
    },
    {
      "type": "grant",
      "userIds": ["user123"],
      "permissionSet": "ACCOUNTANT"
    }
  ]
}
```

## Integration with Existing System

The user-specific permissions system works alongside the existing role-based system:

1. **Backward Compatibility** - All existing role-based permissions continue to work
2. **Enhanced Security** - Additional layer of permission checking
3. **Flexible Access Control** - Granular control without changing user roles
4. **Temporary Access** - Grant temporary permissions without permanent role changes

## Monitoring and Maintenance

### 1. **Permission Audits**
- Regular review of granted permissions
- Check for expired permissions
- Monitor permission usage patterns

### 2. **Cleanup Tasks**
- Deactivate expired permissions
- Remove inactive user permissions
- Archive old permission profiles

### 3. **Performance Considerations**
- Indexes on frequently queried fields
- Pagination for large permission lists
- Caching for permission checks

## Best Practices

1. **Use Permission Sets** for common scenarios instead of individual permissions
2. **Set Expiration Dates** for temporary access to ensure automatic cleanup
3. **Provide Reasons** for permission grants to maintain audit trail
4. **Regular Reviews** of granted permissions to ensure they're still needed
5. **Test Permissions** before granting to ensure they work as expected
6. **Document Permission Patterns** for common use cases in your school

This enhanced permissions system provides school administrators with the flexibility they need to manage access control effectively while maintaining security and auditability.
