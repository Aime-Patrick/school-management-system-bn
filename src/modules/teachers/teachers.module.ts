import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { UtilsModule } from 'src/utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { School, SchoolSchema } from '../../schemas/school.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [UtilsModule,
    MailModule,
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema },
      { name: School.name, schema: SchoolSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [TeachersController],
  providers: [TeachersService]
})
export class TeachersModule {}
