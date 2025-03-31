import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
      if (!requiredRoles) return true; // If no roles are required, allow access
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user || !requiredRoles.includes(user.role)) {
        throw new ForbiddenException(
          'Forbidden. You do not have permission to access this resource.',
        );
      }
      return true;
    }
  }