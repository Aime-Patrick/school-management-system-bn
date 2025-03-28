import { Module } from '@nestjs/common';
import { AssignmentController } from './assignments.controller';
import { AssignmentService } from './assignments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentSchema, Assignment } from 'src/schemas/assignment.schema';
import { Teacher,TeacherSchema } from 'src/schemas/teacher.schema';
import { Student, StudentSchema } from 'src/schemas/student.schema';
@Module({
  imports :[
    MongooseModule.forFeature([{name: Assignment.name, schema: AssignmentSchema}]),
    MongooseModule.forFeature([{name: Teacher.name, schema: TeacherSchema}]),
    MongooseModule.forFeature([{name: Student.name, schema: StudentSchema}]),
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService]
})
export class AssignmentsModule {}
