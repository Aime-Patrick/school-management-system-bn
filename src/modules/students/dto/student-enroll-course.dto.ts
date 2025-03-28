import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class StudentEnrollIntoCourseDto {
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({example: "course Id", description: "Student enroll to course",})
    courseId: string;
}