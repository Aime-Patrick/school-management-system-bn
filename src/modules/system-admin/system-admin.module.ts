import { Module } from '@nestjs/common';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';
import { SchoolModule } from '../school/school.module';
import { UtilsModule } from 'src/utils/utils.module';
import { StudentsModule } from '../students/students.module';
@Module({
  imports:[SchoolModule, UtilsModule, StudentsModule],
  controllers: [SystemAdminController],
  providers: [SystemAdminService]
})
export class SystemAdminModule {}
