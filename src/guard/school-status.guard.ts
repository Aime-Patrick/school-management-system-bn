import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SchoolService } from '../modules/school/school.service';

@Injectable()
export class SchoolStatusGuard implements CanActivate {
  constructor(private schoolService: SchoolService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // System admin can always access (bypass school status check)
    if (user.role === 'system-admin') {
      return true;
    }

    // For other users, check if their school is active
    if (user.schoolId) {
      try {
        const isActive = await this.schoolService.isSchoolActive(user.schoolId);
        if (!isActive) {
          throw new ForbiddenException('Your school account has been suspended. Please contact the system administrator.');
        }
        return true;
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        // If school not found or other error, allow access (let other guards handle)
        return true;
      }
    }

    // If no schoolId, allow access (let other guards handle)
    return true;
  }
}
