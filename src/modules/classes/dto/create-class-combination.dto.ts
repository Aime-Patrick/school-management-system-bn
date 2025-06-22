import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCombinationDto {
  @ApiProperty({
    example: 'A',
    description: 'The name of the class',
  })
  @IsString()
  name: string;
}