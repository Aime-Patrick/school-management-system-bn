import { IsString, IsArray, IsOptional, IsBoolean, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionAction, PermissionResource } from '../../../schemas/permission.schema';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'The resource this permission applies to',
    enum: PermissionResource,
    example: PermissionResource.FEE_CATEGORIES,
  })
  @IsEnum(PermissionResource)
  resource: string;

  @ApiProperty({
    description: 'The action this permission allows',
    enum: PermissionAction,
    example: PermissionAction.CREATE,
  })
  @IsEnum(PermissionAction)
  action: string;

  @ApiProperty({
    description: 'Array of roles that have this permission',
    type: [String],
    example: ['school-admin', 'system-admin'],
    items: {
      type: 'string',
      enum: ['system-admin', 'school-admin', 'teacher', 'student', 'parent', 'accountant', 'librarian']
    }
  })
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @ApiProperty({
    description: 'Optional conditions for this permission',
    required: false,
    example: {
      schoolId: '507f1f77bcf86cd799439011',
      isOwner: false
    }
  })
  @IsOptional()
  conditions?: {
    schoolId?: string;
    isOwner?: boolean;
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Whether this permission is active',
    required: false,
    default: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'School ID for school-specific permissions',
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsMongoId()
  school?: string;
}
