import { Body, Controller, Get, Param, Post,Req,UseGuards } from '@nestjs/common';
import { AssignmentService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { RolesGuard } from 'src/guard/roles.guard';
import { ApiTags,ApiOperation, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('assignments')
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Create assignment', description: 'Create a new assignment record.' })
  createAssignment(@Body() createAssignmentDto: CreateAssignmentDto, @Req() req) {
    const user = req.user.id;
    return this.assignmentService.createAssignment(createAssignmentDto, user);
  }

  @Get(':courseId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get assignments by course', description: 'Get all quizzes for a specific course.' })
  getAssignmentsByCourse(@Param('courseId') courseId: string) {
    return this.assignmentService.getAssignmentsByCourse(courseId);
  }

  @Post(':assignmentId/submit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  submitAssignment(@Param('assignmentId') assignmentId: string, @Body() body: { studentId: string; score: number }) {
    return this.assignmentService.submitAssignment(assignmentId, body.studentId, body.score);
  }
}

