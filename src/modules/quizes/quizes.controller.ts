import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuizService } from './quizes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { RolesGuard } from 'src/guard/roles.guard';
@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a new quiz', description: 'Create a new quiz record.' })
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return await this.quizService.createQuiz(createQuizDto);
  }

  @Get(':courseId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get quizzes by course', description: 'Get all quizzes for a specific course.' })
  async getQuizzesByCourse(@Param('courseId') courseId: string) {
    return this.quizService.getQuizzesByCourse(courseId);
  }

  @Post(':quizId/score')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Record quiz score', description: 'Record a student\'s quiz score.' })
  async recordQuizScore(@Param('quizId') quizId: string, @Body() body: { studentId: string; score: number }) {
    return await this.quizService.recordQuizScore(quizId, body.studentId, body.score);
  }
}
