import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { Finance, FinanceSchema } from 'src/schemas/financial.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceService } from './finance.service';
@Module({
  imports:[
    MongooseModule.forFeature([{name: Finance.name, schema: FinanceSchema}])
  ],
  controllers: [FinanceController],
  providers: [FinanceService]
})
export class FinancialModule {}
