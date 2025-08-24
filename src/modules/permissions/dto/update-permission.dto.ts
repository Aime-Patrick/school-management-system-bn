import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { PermissionAction, PermissionResource } from '../../../schemas/permission.schema';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ApiProperty({
    description: 'The resource this permission applies to (optional for updates)',
    enum: PermissionResource,
    example: PermissionResource.FEE_CATEGORIES,
    required: false,
  })
  resource?: string;

  @ApiProperty({
    description: 'The action this permission allows (optional for updates)',
    enum: PermissionAction,
    example: PermissionAction.CREATE,
    required: false,
  })
  action?: string;

  @ApiProperty({
    description: 'Array of roles that have this permission (optional for updates)',
    type: [String],
    example: ['school-admin', 'system-admin'],
    required: false,
    items: {
      type: 'string',
      enum: ['system-admin', 'school-admin', 'teacher', 'student', 'parent', 'accountant', 'librarian']
    }
  })
  roles?: string[];
}
