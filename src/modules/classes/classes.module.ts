import { Module } from '@nestjs/common';
import { ClassService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class, ClassSchema } from '../../schemas/class.schema';
import { Student, StudentSchema } from '../../schemas/student.schema';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Teacher.name, schema: TeacherSchema },
    ]),
  ],
  providers: [ClassService],
  controllers: [ClassesController]
})
export class ClassesModule {}
