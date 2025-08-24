import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResourcePermissionDto {
  @ApiProperty({
    description: 'Permissions mapping (action -> roles)',
    example: {
      'CREATE': ['school-admin', 'system-admin'],
      'UPDATE': ['school-admin', 'system-admin'],
      'DELETE': ['school-admin', 'system-admin'],
      'VIEW': ['school-admin', 'system-admin', 'teacher', 'student', 'accountant']
    },
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['system-admin', 'school-admin', 'teacher', 'student', 'parent', 'accountant', 'librarian']
      }
    }
  })
  @IsObject()
  permissions: Record<string, string[]>; // action -> roles mapping
}

export class UpdateResourcePermissionsDto {
  @ApiProperty({
    description: 'Permissions mapping (action -> roles) for a resource',
    example: {
      'CREATE': ['school-admin', 'system-admin'],
      'UPDATE': ['school-admin', 'system-admin'],
      'DELETE': ['school-admin', 'system-admin'],
      'VIEW': ['school-admin', 'system-admin', 'teacher', 'student', 'accountant']
    },
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['system-admin', 'school-admin', 'teacher', 'student', 'parent', 'accountant', 'librarian']
      }
    }
  })
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  permissions: Record<string, string[]>;
}
