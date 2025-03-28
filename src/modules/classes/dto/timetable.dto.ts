import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleDto {
  @ApiProperty({
    example: 'Math',
    description: 'The subject being taught',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    example: '10:00 AM',
    description: 'The start time of the class',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    example: '11:00 AM',
    description: 'The end time of the class',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the teacher for the class',
  })
  @IsString()
  teacher: string;
}

export class TimetableDto {
  @ApiProperty({
    example: 'Monday',
    description: 'The day of the week',
  })
  @IsString()
  day: string;

  @ApiProperty({
    example: [
      {
        subject: 'Math',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        teacher: 'John Doe',
      },
    ],
    description: 'The schedule for the day',
    type: [ScheduleDto],
  })
  @IsArray()
  schedule: ScheduleDto[];
}