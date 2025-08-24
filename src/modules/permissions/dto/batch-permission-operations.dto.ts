import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsDate, ValidateNested, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionResource, PermissionAction } from '../../../schemas/permission.schema';

export class PermissionOperationDto {
  @ApiProperty({ 
    enum: ['grant', 'revoke', 'update'], 
    description: 'Type of operation to perform'
  })
  @IsEnum(['grant', 'revoke', 'update'])
  type: 'grant' | 'revoke' | 'update';

  @ApiProperty({ 
    type: [String], 
    description: 'Array of user IDs for this operation',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
  })
  @IsArray()
  @IsMongoId({ each: true })
  userIds: string[];

  @ApiProperty({ 
    type: [Object], 
    required: false,
    description: 'Specific permissions for this operation (required for grant/revoke)'
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  permissions?: {
    resource: PermissionResource;
    actions: PermissionAction[];
  }[];

  @ApiProperty({ 
    required: false,
    description: 'Permission set name (alternative to specific permissions)'
  })
  @IsOptional()
  @IsString()
  permissionSet?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Expiration date for granted permissions',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiProperty({ 
    required: false, 
    description: 'Reason for this operation'
  })
  @IsOptional()
  reason?: string;
}

export class BatchPermissionOperationsDto {
  @ApiProperty({ 
    type: [PermissionOperationDto], 
    description: 'Array of operations to perform'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionOperationDto)
  operations: PermissionOperationDto[];
}
