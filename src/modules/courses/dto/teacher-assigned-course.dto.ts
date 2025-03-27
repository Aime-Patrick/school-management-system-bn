import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";

export class TeacherAssignedCourses {
    @ApiProperty({example: "Teach ID", description : "Get All Courses tought by a teacher"})
    @IsString()
    @IsMongoId()
    teacher: string;
}