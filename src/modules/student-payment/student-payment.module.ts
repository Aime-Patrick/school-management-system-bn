import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StudentPayment,
  StudentPaymentSchema,
} from 'src/schemas/student-payment';
import { StudentPaymentService } from './student-payment.service';
import { StudentPaymentController } from './student-payment.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { Term, TermSchema } from 'src/schemas/terms.schama';
import { Academic, AcademicSchema } from 'src/schemas/academic-year.schema';
@Module({
  imports: [
    UtilsModule,
    MongooseModule.forFeature([
      { name: StudentPayment.name, schema: StudentPaymentSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Term.name, schema: TermSchema },
      { name: Academic.name, schema: AcademicSchema },
    ]),
  ],
  controllers: [StudentPaymentController],
  providers: [StudentPaymentService],
  exports: [StudentPaymentService],
})
export class StudentPaymentModule {}
