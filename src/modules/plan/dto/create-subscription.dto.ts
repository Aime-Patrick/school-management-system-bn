import { IsEnum, IsNotEmpty, IsNumber, IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { planType } from '../../../schemas/plan.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Basic Plan', description: 'Name of the subscription plan' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({ example: 20000, description: 'Amount to be paid for the plan in RWF' })
  @IsNumber()
  planAmount: number;

  @ApiProperty({ enum: planType, example: planType.MONTHLY, description: 'Type of the plan (monthly, quarterly, yearly)' })
  @IsEnum(planType)
  planType: planType;

  @ApiProperty({ example: 30, description: 'Duration of the plan in days' })
  @IsNumber()
  planDuration: number;

  @ApiProperty({ example: ['Manage Students', 'Access Reports'], description: 'Features included in the subscription' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  planContent: string[];
}
