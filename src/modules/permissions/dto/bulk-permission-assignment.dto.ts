import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsDate, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionResource, PermissionAction } from '../../../schemas/permission.schema';

export class PermissionDto {
  @ApiProperty({ enum: PermissionResource, description: 'Resource to grant permission for' })
  @IsEnum(PermissionResource)
  resource: PermissionResource;

  @ApiProperty({ 
    type: [String], 
    enum: PermissionAction, 
    description: 'Actions to grant for this resource',
    example: ['VIEW', 'CREATE']
  })
  @IsArray()
  @IsEnum(PermissionAction, { each: true })
  actions: PermissionAction[];
}

export class BulkPermissionAssignmentDto {
  @ApiProperty({ 
    type: [String], 
    description: 'Array of user IDs to assign permissions to',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
  })
  @IsArray()
  @IsMongoId({ each: true })
  userIds: string[];

  @ApiProperty({ 
    type: [PermissionDto], 
    description: 'Array of permissions to assign'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @ApiProperty({ 
    required: false, 
    description: 'Optional expiration date for the permissions',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiProperty({ 
    required: false, 
    description: 'Optional reason for granting these permissions'
  })
  @IsOptional()
  reason?: string;
}
