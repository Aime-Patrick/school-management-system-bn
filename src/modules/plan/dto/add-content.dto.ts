import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class AddContentDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    content: string[];
  }
  