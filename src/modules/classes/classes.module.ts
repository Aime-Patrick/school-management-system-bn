import { Module } from '@nestjs/common';
import { ClassService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class, ClassSchema } from '../../schemas/class.schema';
import { Student, StudentSchema } from '../../schemas/student.schema';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { School,SchoolSchema } from 'src/schemas/school.schema';
import { Result,ResultSchema } from 'src/schemas/result.schema';
import { ResultModule } from '../result/result.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Result.name, schema:  ResultSchema},
    ]),
    ResultModule,
  ],
  providers: [ClassService],
  controllers: [ClassesController]
})
export class ClassesModule {}
