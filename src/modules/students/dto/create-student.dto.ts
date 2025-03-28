import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsDate, IsArray, IsMongoId } from 'class-validator';
import { StudentGender, StudentStatus } from '../../../schemas/student.schema';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsDate()
  @IsNotEmpty()
  @Type(()=> Date)
  dateOfBirth: Date;


  @ApiProperty({ example: 'male', enum: StudentGender })
  @IsEnum(StudentGender)
  @IsNotEmpty()
  gender: StudentGender;

  @ApiProperty({ example: '123-456-7890' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '2022-09-01' })
  @IsDate()
  @IsNotEmpty()
  @Type(()=> Date)
  enrollmentDate: Date;

  @ApiProperty({ example: '2026-06-01', required: false })
  @IsDate()
  @Type(()=> Date)
  graduationDate?: Date;

  @ApiProperty({ example: 'active', enum: StudentStatus })
  @IsEnum(StudentStatus)
  @IsNotEmpty()
  status: StudentStatus;

}