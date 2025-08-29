import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsDate, IsEnum, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountantStatus, AccountantGender, EmploymentType, AccountingSpecialization } from '../../../schemas/accountant.schema';

export class EmergencyContactDto {
  @ApiProperty({ example: 'Jane Johnson', description: 'Emergency contact person name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Spouse', description: 'Relationship to the accountant' })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ example: '+1234567890', description: 'Emergency contact phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class BankAccountInfoDto {
  @ApiProperty({ example: 'Chase Bank', description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: '1234567890', description: 'Account number' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: '021000021', description: 'Routing number' })
  @IsString()
  @IsNotEmpty()
  routingNumber: string;
}

export class CreateAccountantDto {
  @ApiProperty({ example: 'Mike', description: 'Accountant first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Johnson', description: 'Accountant last name' })
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

  @ApiProperty({ example: 'active', enum: AccountantStatus, description: 'Employment status' })
  @IsEnum(AccountantStatus)
  @IsNotEmpty()
  status: AccountantStatus;

  @ApiProperty({ example: 'Finance Department', description: 'Department assignment' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'Male', enum: AccountantGender, description: 'Gender' })
  @IsEnum(AccountantGender)
  @IsNotEmpty()
  gender: AccountantGender;

  @ApiProperty({ example: 'Full-time', enum: EmploymentType, description: 'Employment type' })
  @IsEnum(EmploymentType)
  @IsNotEmpty()
  employmentType: EmploymentType;

  @ApiProperty({ example: 'Bachelor of Accounting', description: 'Educational qualifications' })
  @IsString()
  @IsNotEmpty()
  qualifications: string;

  @ApiProperty({ example: '5 years in school financial management', description: 'Work experience' })
  @IsString()
  @IsNotEmpty()
  experience: string;

  @ApiProperty({ example: 'mike.johnson@school.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ 
    example: 'General Accounting', 
    enum: AccountingSpecialization, 
    description: 'Area of specialization',
    required: false
  })
  @IsEnum(AccountingSpecialization)
  @IsOptional()
  specialization?: AccountingSpecialization;

  @ApiProperty({ 
    example: ['CPA', 'CMA', 'QuickBooks Certified'], 
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
    example: ['QuickBooks', 'Excel', 'Sage'], 
    description: 'Software proficiency',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  softwareProficiency?: string[];

  @ApiProperty({ example: 'TAX123456', description: 'Professional tax ID', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ 
    type: BankAccountInfoDto, 
    description: 'Bank account information for payroll',
    required: false
  })
  @IsOptional()
  bankAccountInfo?: BankAccountInfoDto;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'Profile picture file'
  })
  @IsOptional()
  profilePicture?: any;
}
