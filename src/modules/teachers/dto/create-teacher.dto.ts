import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsDate, IsEnum, IsMongoId } from 'class-validator';
import { TeacherStatus, TeacherGender } from '../../../schemas/teacher.schema';
import { Type } from 'class-transformer';

export class CreateTeacherDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1985-05-15T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ example: '123-456-7890' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '2022-09-01T00:00:00.000Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(()=> Date)
  hiredDate: Date;

  @ApiProperty({ example: 'active', enum: TeacherStatus })
  @IsEnum(TeacherStatus)
  @IsNotEmpty()
  status: TeacherStatus;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'male', enum: TeacherGender })
  @IsEnum(TeacherGender)
  @IsNotEmpty()
  gender: TeacherGender;

}