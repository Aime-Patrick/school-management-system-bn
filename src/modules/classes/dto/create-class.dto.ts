import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateClassDto {
  @ApiProperty({
    description: 'The name of the class',
    example: 'Year 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}