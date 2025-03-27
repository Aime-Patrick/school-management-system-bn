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
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

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
    @UploadedFile() receipt: Express.Multer.File,
  ) {
    return this.financeService.createPayment(createPaymentDto, receipt);
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
  async getAllPayments(
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('filterType') filterType?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.financeService.getPayments(status, date, filterType);
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
    return this.financeService.getPaymentById(id);
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
    return this.financeService.updatePayment(id, updatePaymentDto);
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
    return this.financeService.deletePayment(id);
  }
}
