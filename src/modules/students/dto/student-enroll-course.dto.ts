import { IsEmpty, IsMongoId, IsString } from "class-validator";

export class StudentEnrollIntoCourseDto {
    @IsString()
    @IsMongoId()
    @IsEmpty()
    courseId: string;
}