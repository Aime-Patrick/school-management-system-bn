import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { UtilsModule } from 'src/utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../../schemas/student.schema';
import { School, SchoolSchema } from '../../schemas/school.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CourseSchema, Course } from 'src/schemas/course.schema';
@Module({
  imports: [
    UtilsModule,
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: School.name, schema: SchoolSchema },
      {name: User.name, schema: UserSchema},
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  exports: [StudentsService],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
