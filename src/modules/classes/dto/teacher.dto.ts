import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the teacher',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'The unique ID of the teacher',
  })
  @IsString()
  teacherId: string;
}