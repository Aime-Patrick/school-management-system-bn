import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Greenwood High School' })
  @IsString()
  @IsNotEmpty()
  schoolName: string;


  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  schoolLogo?: any;
  

}