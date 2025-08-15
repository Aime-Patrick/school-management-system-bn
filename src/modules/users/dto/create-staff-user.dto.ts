import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../schemas/user.schema';

export class CreateStaffUserDto {
  @ApiProperty({ 
    example: 'john.doe', 
    description: 'Username for the staff member' 
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    example: 'john.doe@school.com', 
    description: 'Email address for the staff member' 
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  
  @ApiProperty({ 
    example: 'password123', 
    description: 'Password for the staff member account' 
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({ 
    minLength: 8, 
    minUppercase: 1, 
    minLowercase: 1, 
    minNumbers: 1, 
    minSymbols: 1 
  }, { 
    message: 'Password must contain symbols, numbers, uppercase letters, and lowercase letters' 
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ 
    example: "089-898-898",
    description: "Phone number for the staff member"
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ 
    example: 'John', 
    description: 'First name of the staff member' 
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ 
    example: 'Doe', 
    description: 'Last name of the staff member' 
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'School ID where the staff member will work' 
  })
  @IsMongoId()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({ 
    example: 'Library Department', 
    description: 'Department or section where the staff member will work' 
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ 
    example: 'Full-time', 
    description: 'Employment type (Full-time, Part-time, Contract)' 
  })
  @IsString()
  @IsOptional()
  employmentType?: string;

  @ApiProperty({ 
    example: '2024-01-15', 
    description: 'Date when the staff member starts working' 
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    example: 'Bachelor of Library Science', 
    description: 'Educational qualifications of the staff member' 
  })
  @IsString()
  @IsOptional()
  qualifications?: string;

  @ApiProperty({ 
    example: '5 years experience in school library management', 
    description: 'Work experience and skills' 
  })
  @IsString()
  @IsOptional()
  experience?: string;
}
