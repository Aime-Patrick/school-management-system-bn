// guards/subscription.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from 'src/schemas/school.schema';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectModel(School.name) private readonly schoolModel: Model<School>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const schoolId = request.user?.schoolId;

    const now = new Date();
    const school = await this.schoolModel.findById(schoolId);
    const isActive =
          school &&
          school.isActive &&
          school.subscriptionStart &&
          school.subscriptionEnd &&
          now >= school.subscriptionStart &&
          now <= school.subscriptionEnd;

    if (!isActive) {
      throw new ForbiddenException('Your subscription plan is inactive or expired.');
    }

    return true;
  }
}
