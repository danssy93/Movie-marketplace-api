import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/role.decorator';
import { AdministratorType } from 'src/database/enums';
import AppError from '../error/AppError';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();

    console.log('🔍 request.user =', request.user);
    const user = request.user;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];

    console.log('🔍 userRoles =', userRoles);
    console.log('🔍 requiredRoles =', requiredRoles);
    console.log(
      '🔍 AdministratorType.SUPERADMIN =',
      AdministratorType.SUPERADMIN,
    );
    console.log(
      '🔍 includes check =',
      userRoles.includes(AdministratorType.SUPERADMIN),
    ); // 👈 add this
    console.log(
      '🔍 userRoles[0] charCodeAt =',
      [...userRoles[0]].map((c) => c.charCodeAt(0)),
    ); // 👈 and this

    if (userRoles.includes(AdministratorType.SUPERADMIN)) {
      return true;
    }

    // Check if the user has at least one of the required roles
    const hasRequiredRole = userRoles.some((role) =>
      requiredRoles.includes(role),
    );

    if (!hasRequiredRole) {
      throw new AppError(
        'Forbidden: Insufficient permissions',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
