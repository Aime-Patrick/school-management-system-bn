import { Module } from '@nestjs/common';
import { Quiz,QuizSchema } from 'src/schemas/quize.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quizes.controller';
import { QuizService } from './quizes.service';
import { Teacher, TeacherSchema } from 'src/schemas/teacher.schema';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { Term, TermSchema } from 'src/schemas/terms.schama';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
        MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
        MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
        MongooseModule.forFeature([{ name: Term.name, schema: TermSchema }]),
    ],
    controllers: [QuizController],
    providers: [QuizService],
    exports: [QuizService]
})
export class QuizesModule {}
