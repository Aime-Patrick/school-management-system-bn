import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment,PaymentSchema } from 'src/schemas/payment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { UtilsModule } from 'src/utils/utils.module';
@Module({
  imports:[
    UtilsModule,
    MongooseModule.forFeature([{name: Payment.name, schema:PaymentSchema}])
  ],
  providers: [PaymentService],
  controllers:[PaymentController]
})
export class PaymentModule {}
