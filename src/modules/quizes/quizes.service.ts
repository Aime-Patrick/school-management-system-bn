import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz } from 'src/schemas/quize.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizService {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<Quiz>) {}

  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quiz = new this.quizModel(createQuizDto);
    return await quiz.save();
  }

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    return await this.quizModel.find({ course: courseId }).populate(['teacher', 'term']).exec();
  }

  async recordQuizScore(quizId: string, studentId: string, score: number): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');

    quiz.results.push({ student: new Types.ObjectId(studentId), score });
    return await quiz.save();
  }
}
