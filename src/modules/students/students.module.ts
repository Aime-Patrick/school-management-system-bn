import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { UtilsModule } from 'src/utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { StudentCredentials, StudentCredentialsSchema } from 'src/schemas/student-credentials.schema';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CourseSchema, Course } from 'src/schemas/course.schema';
import { Teacher, TeacherSchema } from 'src/schemas/teacher.schema';
import { Class, ClassSchema } from 'src/schemas/class.schema';
import { HashService } from 'src/utils/utils.service';
import { StudentPayment, StudentPaymentSchema } from 'src/schemas/student-payment';

@Module({
  imports: [
    UtilsModule,
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: StudentCredentials.name, schema: StudentCredentialsSchema },
      { name: School.name, schema: SchoolSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Class.name, schema: ClassSchema },
      { name: StudentPayment.name, schema: StudentPaymentSchema },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, HashService],
  exports: [StudentsService],
})
export class StudentsModule {}
