import { Module } from '@nestjs/common';
import { Quiz,QuizSchema } from 'src/schemas/quize.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quizes.controller';
import { QuizService } from './quizes.service';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    ],
    controllers: [QuizController],
    providers: [QuizService],
    exports: [QuizService]
})
export class QuizesModule {}
