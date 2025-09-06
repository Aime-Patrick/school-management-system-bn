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
    example: '68ab6779e4845848c60d37a8',
    description: 'The teacher ID or teacher object with _id',
  })
  @IsString()
  teacher: string | { _id: string; firstName: string; lastName: string };
}

export class TimetableDto {
  @ApiProperty({
    example: 'Monday',
    description: 'The day of the week',
  })
  @IsString()
  day: string;
  @ApiProperty({
    example: '2021-01-01',
    description: 'The date of the day',
  })
  @IsString()
  date: string;

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