import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsBoolean } from 'class-validator';

export class CopyPermissionsDto {
  @ApiProperty({ 
    description: 'ID of the user to copy permissions from',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  sourceUserId: string;

  @ApiProperty({ 
    type: [String], 
    description: 'Array of user IDs to copy permissions to',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']
  })
  @IsArray()
  @IsMongoId({ each: true })
  targetUserIds: string[];

  @ApiProperty({ 
    required: false, 
    description: 'Whether to copy expiration dates from source user',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  includeExpiration?: boolean;

  @ApiProperty({ 
    required: false, 
    description: 'Optional reason for copying these permissions'
  })
  @IsOptional()
  reason?: string;
}
