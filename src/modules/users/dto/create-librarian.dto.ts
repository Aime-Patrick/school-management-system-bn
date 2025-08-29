import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsDate, IsEnum, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { LibrarianStatus, LibrarianGender, EmploymentType } from '../../../schemas/librarian.schema';

export class EmergencyContactDto {
  @ApiProperty({ example: 'Jane Wilson', description: 'Emergency contact person name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Spouse', description: 'Relationship to the librarian' })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ example: '+1234567890', description: 'Emergency contact phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class CreateLibrarianDto {
  @ApiProperty({ example: 'Sarah', description: 'Librarian first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Wilson', description: 'Librarian last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1985-05-15T00:00:00.000Z', description: 'Date of birth' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ example: '123 Main St', description: 'Home address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'New York', description: 'City of residence' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z', description: 'Date when hired' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  hiredDate: Date;

  @ApiProperty({ example: 'active', enum: LibrarianStatus, description: 'Employment status' })
  @IsEnum(LibrarianStatus)
  @IsNotEmpty()
  status: LibrarianStatus;

  @ApiProperty({ example: 'Library Department', description: 'Department assignment' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'Female', enum: LibrarianGender, description: 'Gender' })
  @IsEnum(LibrarianGender)
  @IsNotEmpty()
  gender: LibrarianGender;

  @ApiProperty({ example: 'Full-time', enum: EmploymentType, description: 'Employment type' })
  @IsEnum(EmploymentType)
  @IsNotEmpty()
  employmentType: EmploymentType;

  @ApiProperty({ example: 'Master of Library Science', description: 'Educational qualifications' })
  @IsString()
  @IsNotEmpty()
  qualifications: string;

  @ApiProperty({ example: '8 years experience in school library management', description: 'Work experience' })
  @IsString()
  @IsNotEmpty()
  experience: string;

  @ApiProperty({ example: 'john.doe@school.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Children\'s Literature', description: 'Area of specialization', required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ 
    example: ['ALA Certification', 'Digital Library Specialist'], 
    description: 'Professional certifications',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @ApiProperty({ example: '8:00 AM - 4:00 PM', description: 'Working hours', required: false })
  @IsString()
  @IsOptional()
  workingHours?: string;

  @ApiProperty({ 
    type: EmergencyContactDto, 
    description: 'Emergency contact information',
    required: false
  })
  @IsOptional()
  emergencyContact?: EmergencyContactDto;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'Profile picture file'
  })
  @IsOptional()
  profilePicture?: any;
}
