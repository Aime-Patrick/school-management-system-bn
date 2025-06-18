import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsString } from "class-validator";

export class CreateClassDto {
  @ApiProperty({
    description: 'The name of the class',
    example: 'Year 1',
  })
  @IsString()
  @IsNotEmpty()
  @IsAlpha()
  name: string;
}