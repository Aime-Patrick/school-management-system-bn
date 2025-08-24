import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MailModule } from '../mail/mail.module';
import { Teacher, TeacherSchema } from 'src/schemas/teacher.schema';
import { SchoolCodeGenerator } from 'src/utils/school-code-generator';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
   UtilsModule,MailModule],
  controllers: [SchoolController],
  providers: [SchoolService, SchoolCodeGenerator],
  exports: [SchoolService]
})

export class SchoolModule {}
