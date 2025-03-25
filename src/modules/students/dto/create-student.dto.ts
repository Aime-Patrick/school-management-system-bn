import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsDate, IsArray, IsMongoId } from 'class-validator';
import { StudentGender, StudentStatus } from '../../../schemas/student.schema';

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
  dateOfBirth: Date;

  @ApiProperty({ example: 9 })
  @IsNotEmpty()
  grade: number;

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
  enrollmentDate: Date;

  @ApiProperty({ example: '2026-06-01', required: false })
  @IsDate()
  graduationDate?: Date;

  @ApiProperty({ example: 'active', enum: StudentStatus })
  @IsEnum(StudentStatus)
  @IsNotEmpty()
  status: StudentStatus;

  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsMongoId()
  @IsNotEmpty()
  parentId: string;

  @ApiProperty({ example: ['60d0fe4f5311236168a109cb', '60d0fe4f5311236168a109cc'] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  courseIds: string[];

  @ApiProperty({ example: '60d0fe4f5311236168a109cd' })
  @IsMongoId()
  @IsNotEmpty()
  school: string;
}