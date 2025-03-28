import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: 'Annual Sports Day',
    description: 'The name of the event',
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    example: '2025-03-30',
    description: 'The date of the event in YYYY-MM-DD format',
  })
  @IsDateString()
  date: string; // Format: YYYY-MM-DD

  @ApiProperty({
    example: '10:00 AM',
    description: 'The time of the event',
  })
  @IsString()
  time: string;

  @ApiProperty({
    example: 'School Ground',
    description: 'The location of the event',
  })
  @IsString()
  location: string;

  @ApiProperty({
    example: 'A day to celebrate sports and physical activities.',
    description: 'A brief description of the event',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb'],
    description: 'An array of user IDs invited to the event',
    required: false,
  })
  @IsArray()
  @IsOptional()
  invitees: string[];
}
