import { Module } from '@nestjs/common';
import { HashService } from './utils.service';

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class UtilsModule {}
