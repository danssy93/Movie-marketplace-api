import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
// This decorator can be used to specify the roles required to access a specific route or handler.
// It can be applied to controllers or route handlers to enforce role-based access control.
// Example usage:
// @Roles('admin', 'user')
// @Get('some-protected-route')
// async someProtectedRoute() {
//   // Your route handler logic here
// }
// This will ensure that only users with the 'admin' or 'user' roles can access this route.
// You can also use it in combination with guards to enforce the role checks.
//
