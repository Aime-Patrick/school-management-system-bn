import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Greenwood High School' })
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @ApiProperty({ example: 'GHS123' })
  @IsString()
  @IsNotEmpty()
  schoolCode: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

}