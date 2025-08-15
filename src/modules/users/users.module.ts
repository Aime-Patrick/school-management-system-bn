import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema, User } from '../../schemas/user.schema';
import { SchoolSchema, School } from '../../schemas/school.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema }
    ]),
    UtilsModule,
    MailModule
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
