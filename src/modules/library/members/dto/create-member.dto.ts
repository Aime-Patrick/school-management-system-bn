import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min, Max, IsEmail } from 'class-validator';
import { MemberRole, MemberStatus } from '../schemas/member.schema';

export class CreateMemberDto {
  @ApiProperty({
    description: 'User ID from the main user system',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Unique library member ID',
    example: 'LIB001',
  })
  @IsString()
  memberId: string;

  @ApiProperty({
    description: 'Member role in the institution',
    enum: MemberRole,
    example: MemberRole.STUDENT,
  })
  @IsEnum(MemberRole)
  role: MemberRole;

  @ApiProperty({
    description: 'Class or department for students/staff',
    example: 'Class 10A',
    required: false,
  })
  @IsOptional()
  @IsString()
  classOrDept?: string;

  @ApiProperty({
    description: 'Member join date',
    example: '2024-12-01T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @ApiProperty({
    description: 'Membership expiry date',
    example: '2025-12-01T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({
    description: 'Maximum number of books that can be borrowed',
    example: 5,
    default: 3,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxBorrowLimit?: number;

  @ApiProperty({
    description: 'Member status',
    enum: MemberStatus,
    example: MemberStatus.ACTIVE,
    default: MemberStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiProperty({
    description: 'School ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    description: 'Member first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Member last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Member email address',
    example: 'john.doe@school.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Member phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Additional notes about the member',
    example: 'New student, needs orientation',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
