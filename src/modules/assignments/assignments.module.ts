import { Module } from '@nestjs/common';
import { AssignmentController } from './assignments.controller';
import { AssignmentService } from './assignments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentSchema, Assignment } from 'src/schemas/assignment.schema';
@Module({
  imports :[
    MongooseModule.forFeature([{name: Assignment.name, schema: AssignmentSchema}])
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService]
})
export class AssignmentsModule {}
