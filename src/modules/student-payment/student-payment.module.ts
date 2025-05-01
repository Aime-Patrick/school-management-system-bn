import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentPayment, StudentPaymentSchema } from 'src/schemas/student-payment';
import { StudentPaymentService } from './student-payment.service';
import { StudentPaymentController } from './student-payment.controller';
import { UtilsModule } from 'src/utils/utils.module';
@Module({
  imports: [
    UtilsModule,
    MongooseModule.forFeature([{ name: StudentPayment.name, schema: StudentPaymentSchema }]),
  ],
  controllers: [StudentPaymentController],
  providers: [StudentPaymentService],
  exports: [StudentPaymentService],
})
export class StudentPaymentModule {}