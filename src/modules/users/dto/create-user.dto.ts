import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  
  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 }, { message: 'password must be contain symbols,number, uppercase letter, and lowercase letter' })
  @IsNotEmpty({ message: 'password is required' })
  password: string;

  @ApiProperty({ example: "089-898-898"})
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

}
