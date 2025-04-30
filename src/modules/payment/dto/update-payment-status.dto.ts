import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { paymentStatus } from 'src/schemas/payment.schema';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'The new status of the payment',
    enum: paymentStatus,
    example: paymentStatus.APPROVED,
  })
  @IsEnum(paymentStatus, { message: 'Status must be either approved or rejected' })
  status: paymentStatus;
}