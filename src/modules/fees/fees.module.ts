import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeCategory, FeeCategorySchema } from '../../schemas/fee-category.schema';
import { FeeStructure, FeeStructureSchema } from '../../schemas/fee-structure.schema';
import { FeeAssignment, FeeAssignmentSchema } from '../../schemas/fee-assignment.schema';
import { FeePayment, FeePaymentSchema } from '../../schemas/fee-payment.schema';
import { Scholarship, ScholarshipSchema } from '../../schemas/scholarship.schema';
import { InstallmentPlan, InstallmentPlanSchema } from '../../schemas/installment-plan.schema';
import { Student, StudentSchema } from '../../schemas/student.schema';
import { Class, ClassSchema } from '../../schemas/class.schema';
import { School, SchoolSchema } from '../../schemas/school.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Academic, AcademicSchema } from '../../schemas/academic-year.schema';
import { Term, TermSchema } from '../../schemas/terms.schama';

// Services
import { FeeCategoryService } from './services/fee-category.service';
import { FeeStructureService } from './services/fee-structure.service';
import { PaymentService } from './services/payment.service';
import { FeeAssignmentService } from './services/fee-assignment.service';
import { ReportsService } from './services/reports.service';

// Controllers
import { FeeCategoryController } from './controllers/fee-category.controller';
import { FeeStructureController } from './controllers/fee-structure.controller';
import { PaymentController } from './controllers/payment.controller';
import { FeeAssignmentController } from './controllers/fee-assignment.controller';
import { ReportsController } from './controllers/reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeeCategory.name, schema: FeeCategorySchema },
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: FeeAssignment.name, schema: FeeAssignmentSchema },
      { name: FeePayment.name, schema: FeePaymentSchema },
      { name: Scholarship.name, schema: ScholarshipSchema },
      { name: InstallmentPlan.name, schema: InstallmentPlanSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Class.name, schema: ClassSchema },
      { name: School.name, schema: SchoolSchema },
      { name: User.name, schema: UserSchema },
      { name: Academic.name, schema: AcademicSchema },
      { name: Term.name, schema: TermSchema },
    ]),
  ],
  controllers: [
    FeeCategoryController,
    FeeStructureController,
    PaymentController,
    FeeAssignmentController,
    ReportsController,
  ],
  providers: [
    FeeCategoryService,
    FeeStructureService,
    PaymentService,
    FeeAssignmentService,
    ReportsService,
  ],
  exports: [
    FeeCategoryService,
    FeeStructureService,
    PaymentService,
    FeeAssignmentService,
    ReportsService,
  ],
})
export class FeesModule {}
