import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseInterceptors,
  UseGuards,
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { StudentPaymentService } from './student-payment.service';
import { CreateStudentPaymentDto } from './dto/record-student-payment.dto';
import { paymentStatus } from 'src/schemas/student-payment';
import { HashService } from 'src/utils/utils.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
@ApiTags('Student Payments')
@Controller('student-payments')
export class StudentPaymentController {
  constructor(
    private readonly studentPaymentService: StudentPaymentService,
    
  ) {}

  @Post('create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('proof'))
  @ApiOperation({ summary: 'Create a new student payment' })
  async createStudentPayment(
    @Body() createStudentPaymentDto: CreateStudentPaymentDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
   
    const school = req.user.schoolId;
    return this.studentPaymentService.createStudentPayment(
      createStudentPaymentDto,
      school,
      files,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all student payments' })
  @ApiResponse({ status: 200, description: 'List of student payments' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 404, description: 'No student payments found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllStudentPayments(
    @Req() req
  ) {
    const school = req.user.schoolId
    return this.studentPaymentService.getAllStudentPayments(school);
  }

  @Put('status/:paymentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update the status of a student payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updateStudentPaymentStatus(
    @Param('paymentId') paymentId: string,
    @Body() status: paymentStatus,
  ) {
    return this.studentPaymentService.updateStudentPaymentStatus(
      paymentId,
      status,
    );
  }
}
