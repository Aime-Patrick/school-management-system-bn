import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/schemas/user.schema';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { HashService } from 'src/utils/utils.service';
import { RecordPaymentDto } from './dto/record-payment.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService:PaymentService,
        private hashService:HashService
    ){}

    @Post('record-payment')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
    summary: 'Record plan payment',
    description: 'Create a new payment record with optional proof files.',
    })
    @UseInterceptors(FilesInterceptor('proof')) // Use FilesInterceptor for multiple
    async createPayment(
    @Body() recordPaymentDto: RecordPaymentDto,
    @UploadedFiles() files: Express.Multer.File[],
    ) {
  try {

    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => this.hashService.uploadFileToCloudinary(file)),
    );

    const urls = uploadedFiles.map((f) => f.url);
    return this.paymentService.recordPayment({ ...recordPaymentDto, proof: urls });
  } catch (error) {
    throw error;
  }
}

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({
        summary: 'Get Record plan payment',
        description: 'Get all payment records.',
        })
    async getAllPayment () {
    try {
        return this.paymentService.getRecordPayment();
    } catch (error) {
        throw error;
    }
}
}
