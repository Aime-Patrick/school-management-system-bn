import { IsString, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TimetableDto } from './timetable.dto';
import { TeacherDto } from './teacher.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({
    example: 'Class A',
    description: 'The name of the class',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: [
      { id: '60d0fe4f5311236168a109ca' },
      { id: '60d0fe4f5311236168a109cb' },
    ],
    description: 'The list of assigned teachers for the class',
    required: false,
  })
  @IsArray()
  @IsOptional()
  assignedTeachers: TeacherDto[];

  @ApiProperty({
    example: [
      { day: 'Monday', subject: 'Math', time: '10:00 AM - 11:00 AM' },
      { day: 'Tuesday', subject: 'Science', time: '11:00 AM - 12:00 PM' },
    ],
    description: 'The timetable for the class',
    required: false,
    type: [TimetableDto],
  })
  @IsArray()
  @IsOptional()
  @Type(() => TimetableDto)
  timetable: TimetableDto[];

  @ApiProperty({
    example: ['60d0fe4f5311236168a109cc', '60d0fe4f5311236168a109cd'],
    description: 'The list of student IDs in the class',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  students: string[];

}