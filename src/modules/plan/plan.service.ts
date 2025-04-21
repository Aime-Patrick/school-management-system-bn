import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { subscriptionPlan } from 'src/schemas/plan.schema';
import { CreateSubscriptionPlanDto } from './dto/create-subscription.dto';
import { School } from 'src/schemas/school.schema';
import { Payment, paymentPlan } from 'src/schemas/payment.schema';
import { ALLOWED_PLAN_FEATURES } from 'src/utils/enum';
@Injectable()
export class PlanService {
    constructor(
        @InjectModel(subscriptionPlan.name) private subscriptionModel: Model<subscriptionPlan>,
        @InjectModel(School.name) private schoolnModel: Model<School>,
        @InjectModel(Payment.name) private paymentnModel: Model<Payment>,
    ){}

    async createSubscriptionPlan(createSubscriptionPlanDto: CreateSubscriptionPlanDto):Promise<{message:string,subscriptionPlan: subscriptionPlan} > {
        try {
            if (createSubscriptionPlanDto.planContent.some(feature => !ALLOWED_PLAN_FEATURES.includes(feature))) {
                throw new BadRequestException("Some plan features are not recognized.");
              }
              
            const subscriptionPlan=  await this.subscriptionModel.create(createSubscriptionPlanDto);
            return {message: 'Plan created successfull', subscriptionPlan}
        } catch (error) {
            throw error;
        }
    }

    async addContentToSubscription(
        planId: string,
        newContent: string[],
      ): Promise<{ message: string; updatedPlan: subscriptionPlan }> {
        try {
          const updatedPlan = await this.subscriptionModel.findByIdAndUpdate(
            planId,
            { $push: { planContent: { $each: newContent } } },
            { new: true }
          );
      
          if (!updatedPlan) {
            throw new NotFoundException('Subscription plan not found');
          }
      
          return {
            message: 'Content added successfully',
            updatedPlan,
          };
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }

      async removeContentFromSubscription(
        planId: string,
        contentToRemove: string[],
      ): Promise<{ message: string; updatedPlan: subscriptionPlan }> {
        try {
          const updatedPlan = await this.subscriptionModel.findByIdAndUpdate(
            planId,
            { $pull: { planContent: { $in: contentToRemove } } },
            { new: true }
          );
      
          if (!updatedPlan) {
            throw new NotFoundException('Subscription plan not found');
          }
      
          return {
            message: 'Content removed successfully',
            updatedPlan,
          };
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }

      async getAllSubscriptionPlan():Promise<subscriptionPlan[]> {
        try {
            const subscription = await this.subscriptionModel.find();
            return subscription;
        } catch (error) {
            throw error;
        }
      }


      async deleteSubscriptionPlan(id: string): Promise<{ message: string }> {
        try {
          const deleted = await this.subscriptionModel.findByIdAndDelete(id);
      
          if (!deleted) {
            throw new NotFoundException('Subscription plan not found');
          }
      
          return { message: 'Subscription plan deleted successfully' };
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }
      

      async updateSubscriptionPlan(
        id: string,
        updateDto: Partial<CreateSubscriptionPlanDto>
      ): Promise<{ message: string; updatedPlan: subscriptionPlan }> {
        try {
          const updatedPlan = await this.subscriptionModel.findByIdAndUpdate(id, updateDto, {
            new: true,
          });
      
          if (!updatedPlan) {
            throw new NotFoundException('Subscription plan not found');
          }
      
          return { message: 'Subscription plan updated successfully', updatedPlan };
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }
      
      async activateSubscription(schoolId: string): Promise<string> {
        const payment = await this.paymentnModel
          .findOne({ schoolId, status: 'approved' })
          .sort({ date: -1 });
      
        if (!payment) {
          throw new NotFoundException('No approved payment found.');
        }

        const now = new Date();
        let endDate: Date;
      
        switch (payment.plan) {
          case paymentPlan.MONTHLY:
            endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case paymentPlan.quarterly:
            endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + 3);
            break;
          case paymentPlan.YEARLY:
            endDate = new Date(now);
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
          default:
            throw new BadRequestException('Invalid payment plan.');
        }
      
        await this.schoolnModel.findByIdAndUpdate(
          schoolId,
          {
            $set: {
              subscriptionStart: now,
              subscriptionEnd: endDate,
              isActive: true,
            },
          },
          { new: true }
        );
      
        return 'Subscription activated successfully.';
      }
      
      
      
}
