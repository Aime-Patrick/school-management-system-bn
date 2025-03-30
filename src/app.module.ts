import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import databaseConfig from './config/database.config';
import { SeedersModule } from './seeders/seeders.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { SchoolModule } from './modules/school/school.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { QuizesModule } from './modules/quizes/quizes.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { FinancialModule } from './modules/financial/finance.module';
import { TermsModule } from './modules/terms/terms.module';
import { ClassesModule } from './modules/classes/classes.module';
import { EventsModule } from './modules/events/events.module';
import { ResultModule } from './modules/result/result.module';
import { AppController } from './app.controller';
@Module({
  imports: [
    ConfigModule.forRoot({ load: [databaseConfig] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    UsersModule,
    SchoolModule,
    CoursesModule,
    TeachersModule,
    StudentsModule,
    TermsModule,
    ClassesModule,
    EventsModule,
    ResultModule,
    QuizesModule,
    AssignmentsModule,
    FinancialModule,
    SeedersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
