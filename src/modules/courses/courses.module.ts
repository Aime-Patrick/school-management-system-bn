import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { Teacher, TeacherSchema } from 'src/schemas/teacher.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  exports: [CoursesService],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
