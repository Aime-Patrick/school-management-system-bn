import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { subscriptionPlan, subscriptionPlanSchema } from 'src/schemas/plan.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';
@Module({
  imports:[
    MongooseModule.forFeature([{ name: subscriptionPlan.name, schema: subscriptionPlanSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]
    ),
  ],
  controllers: [PlanController],
  providers: [PlanService]
})
export class PlanModule {}
