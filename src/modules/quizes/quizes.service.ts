import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz } from 'src/schemas/quize.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Teacher } from 'src/schemas/teacher.schema';
import { Course } from 'src/schemas/course.schema';
import { Term } from 'src/schemas/terms.schama';
import { RecordScoreDto } from './dto/record-score.dto';
@Injectable()
export class QuizService {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<Quiz>,
  @InjectModel(Teacher.name) private teacherMOdel: Model<Teacher>,
  @InjectModel(Course.name) private courseMOdel: Model<Course>,
  @InjectModel(Term.name) private termMOdel: Model<Term>,
) {}

  async createQuiz(createQuizDto: CreateQuizDto, teacher: string): Promise<Quiz> {
    const teacherId = await this.teacherMOdel.findOne({ "accountCredentails._id": new Types.ObjectId(teacher) });
    if (!teacherId) throw new NotFoundException('Teacher not found');
    const cousreExist = await this.courseMOdel.findById(createQuizDto.course);
    if (!cousreExist) throw new NotFoundException('Course not found');
    const TermExists = await this.termMOdel.findById(createQuizDto.term);
    if (!TermExists) throw new NotFoundException('Term not found');
    const quiz = new this.quizModel({...createQuizDto, teacher:teacherId, courseId:cousreExist.id});
    return await quiz.save();
  }

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    return await this.quizModel.find({ course: courseId }).populate(['teacher', 'term']).exec();
  }

  async recordQuizScore(quizId: string, recordScoreDto:RecordScoreDto): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');

    quiz.results.push({ student: new Types.ObjectId(recordScoreDto.studentId), score: recordScoreDto.score });
    return await quiz.save();
  }
}
