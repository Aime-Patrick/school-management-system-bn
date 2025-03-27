import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, ValidateNested } from "class-validator";

export class AssignTeacherDto {
    @ApiProperty({ example: ['teacher1', 'teacher2'] })
    @IsArray()
    @IsMongoId({each: true})
    teachers: string[];
}