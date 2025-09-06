import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guard/jwt-auth.guard';
import { RolesGuard } from '../../guard/roles.guard';
import { Roles } from '../../decorator/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { AssignmentStatus } from '../../schemas/assignment.schema';

@ApiTags('assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'attachments', maxCount: 10 },
    ]),
  )
  @ApiOperation({ 
    summary: 'Create assignment', 
    description: 'Create a new assignment with optional file attachments' 
  })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @Req() req,
    @UploadedFiles() files?: { attachments?: Express.Multer.File[] },
  ) {
    try {
      const teacherId = req.user.id;
      const schoolId = req.user.schoolId;
      const attachments = files?.attachments || [];

      return await this.assignmentsService.createAssignment(
        createAssignmentDto,
        teacherId,
        schoolId,
        attachments,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post(':assignmentId/submit')
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'files', maxCount: 5 },
    ]),
  )
  @ApiOperation({ 
    summary: 'Submit assignment', 
    description: 'Submit an assignment with optional files' 
  })
  @ApiResponse({ status: 200, description: 'Assignment submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async submitAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() submitDto: SubmitAssignmentDto,
    @Req() req,
    @UploadedFiles() files?: { files?: Express.Multer.File[] },
  ) {
    try {
      const studentId = req.user.id;
      const uploadedFiles = files?.files || [];

      return await this.assignmentsService.submitAssignment(
        assignmentId,
        studentId,
        submitDto,
        uploadedFiles,
      );
    } catch (error) {
      throw error;
    }
  }

  @Put(':assignmentId/grade/:studentId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Grade assignment', 
    description: 'Grade a student\'s assignment submission' 
  })
  @ApiResponse({ status: 200, description: 'Assignment graded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async gradeAssignment(
    @Param('assignmentId') assignmentId: string,
    @Param('studentId') studentId: string,
    @Body() gradeDto: GradeAssignmentDto,
    @Req() req,
  ) {
    try {
      const teacherId = req.user.id;

      return await this.assignmentsService.gradeAssignment(
        assignmentId,
        studentId,
        teacherId,
        gradeDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('teacher')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Get teacher assignments', 
    description: 'Get all assignments created by the teacher' 
  })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  async getTeacherAssignments(@Req() req) {
    try {
      const teacherId = req.user.id;
      const schoolId = req.user.schoolId;

      return await this.assignmentsService.getAssignmentsByTeacher(teacherId, schoolId);
    } catch (error) {
      throw error;
    }
  }

  @Get('student')
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ 
    summary: 'Get student assignments', 
    description: 'Get all assignments assigned to the student' 
  })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  async getStudentAssignments(@Req() req) {
    try {
      const studentId = req.user.id;
      const schoolId = req.user.schoolId;

      return await this.assignmentsService.getAssignmentsByStudent(studentId, schoolId);
    } catch (error) {
      throw error;
    }
  }

  @Get(':assignmentId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ 
    summary: 'Get assignment details', 
    description: 'Get detailed information about a specific assignment' 
  })
  @ApiResponse({ status: 200, description: 'Assignment details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async getAssignmentById(@Param('assignmentId') assignmentId: string, @Req() req) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      return await this.assignmentsService.getAssignmentById(assignmentId, userId, userRole);
    } catch (error) {
      throw error;
    }
  }

  @Put(':assignmentId/status')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Update assignment status', 
    description: 'Update the status of an assignment (draft/published)' 
  })
  @ApiResponse({ status: 200, description: 'Assignment status updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateAssignmentStatus(
    @Param('assignmentId') assignmentId: string,
    @Body() body: { status: AssignmentStatus },
    @Req() req,
  ) {
    try {
      const teacherId = req.user.id;

      return await this.assignmentsService.updateAssignmentStatus(
        assignmentId,
        teacherId,
        body.status,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete(':assignmentId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Delete assignment', 
    description: 'Delete an assignment and all associated files' 
  })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteAssignment(@Param('assignmentId') assignmentId: string, @Req() req) {
    try {
      const teacherId = req.user.id;

      await this.assignmentsService.deleteAssignment(assignmentId, teacherId);
      return { message: 'Assignment deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Get('course/:courseId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get assignments by course', description: 'Get all assignments for a specific course.' })
  async getAssignmentsByCourse(@Param('courseId') courseId: string) {
    return await this.assignmentsService.getAssignmentByCourse(courseId);
  }

  @Get('teacher/:teacherId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get assignments by teacher', description: 'Get all assignments for a specific teacher.' })
  async getAssignmentsByTeacher(@Param('teacherId') teacherId: string, @Req() req) {
    return await this.assignmentsService.getAssignmentsByTeacher(teacherId, req.user.schoolId);
  }

  @Get('pending/:teacherId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get pending assignments', description: 'Get all draft assignments for a specific teacher.' })
  async getPendingAssignments(@Param('teacherId') teacherId: string) {
    return await this.assignmentsService.getPendingAssignments(teacherId);
  }

  @Get('published/:teacherId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get published assignments', description: 'Get all published assignments for a specific teacher.' })
  async getPublishedAssignments(@Param('teacherId') teacherId: string) {
    return await this.assignmentsService.getPublishedAssignments(teacherId);
  }

  @Get('overdue/:teacherId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get overdue assignments', description: 'Get all overdue assignments for a specific teacher.' })
  async getOverdueAssignments(@Param('teacherId') teacherId: string) {
    return await this.assignmentsService.getOverdueAssignments(teacherId);
  }

  @Get('submitted/:teacherId')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get submitted assignments', description: 'Get all assignments with submitted submissions for a specific teacher.' })
  async getSubmittedAssignments(@Param('teacherId') teacherId: string) {
    return await this.assignmentsService.getSubmittedAssignments(teacherId);
  }
}

