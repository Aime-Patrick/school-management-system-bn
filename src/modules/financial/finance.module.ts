import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { Finance, FinanceSchema } from 'src/schemas/financial.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceService } from './finance.service';
import { UtilsModule } from 'src/utils/utils.module';
import { School, SchoolSchema } from 'src/schemas/school.schema';
@Module({
  imports:[
    MongooseModule.forFeature([{name: Finance.name, schema: FinanceSchema}]),
    MongooseModule.forFeature([{name: School.name, schema: SchoolSchema}]),
    UtilsModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService]
})
export class FinancialModule {}
