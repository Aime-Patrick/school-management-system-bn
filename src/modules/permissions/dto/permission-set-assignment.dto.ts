import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionSetAssignmentDto {
  @ApiProperty({ 
    type: [String], 
    description: 'Array of user IDs to assign the permission set to',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
  })
  @IsArray()
  @IsMongoId({ each: true })
  userIds: string[];

  @ApiProperty({ 
    description: 'Name of the permission set to assign',
    example: 'FEE_MANAGER',
    enum: ['FEE_MANAGER', 'STUDENT_VIEWER', 'TEACHER_ASSISTANT', 'LIBRARY_MANAGER', 'ACCOUNTANT']
  })
  @IsString()
  permissionSet: string;

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
