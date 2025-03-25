import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]), UtilsModule],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService]
})

export class SchoolModule {}
