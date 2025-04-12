import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { HashService } from 'src/utils/utils.service';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private hashService: HashService,
  ) {}

  @Post('create-payment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create payment',
    description: 'Create a new payment record with an optional receipt file.',
  })
  @UseInterceptors(FileInterceptor('receipt'))
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException(
          'No files received. Make sure you are uploading at least one file.',
        );
      }
  
      const schoolAdmin = req.user.id;
  
      const uploadedFiles: any[] = [];
      for (const file of files) {
        const uploadedFile  = await this.hashService.uploadFileToCloudinary(file);
        uploadedFiles.push(uploadedFile);
      }
  
      // If you're expecting just 1 file for `proof`, pick the first one:
      const proofUrl = uploadedFiles[0]?.url;
  
      return this.financeService.createPayment(
        createPaymentDto,
        proofUrl,
        schoolAdmin,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('payments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Get Payment record',
    description:
      'Get all payment records by status, date, daily, weekly, monthly.',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({
    name: 'filterType',
    required: false,
    enum: ['daily', 'weekly', 'monthly'],
  })
  async getAllPayments(
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('filterType') filterType?: 'daily' | 'weekly' | 'monthly',
  ) {
    try {
      return this.financeService.getPayments(status, date, filterType);
    } catch (error) {
      throw error;
    }
  }

  @Get('payments/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Get payment by id',
    description: 'Get payment record by id.',
  })
  async getPaymentById(@Param('id') id: string) {
    try {
      return this.financeService.getPaymentById(id);
    } catch (error) {
      throw error;
    }
  }

  @Put('payments/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Update payment',
    description: 'Update payment record by id.',
  })
  @UseInterceptors(FileInterceptor('receipt'))
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
try {
  return this.financeService.updatePayment(id, updatePaymentDto);
} catch (error) {
  throw error;
}  
}

  @Delete('payments/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Delete payment',
    description: 'Delete payment record by id.',
  })
  async deletePayment(@Param('id') id: string) {
    try {
      return this.financeService.deletePayment(id);
    } catch (error) {
      throw error;
    }
  }
}
