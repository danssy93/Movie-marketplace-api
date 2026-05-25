import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUserDetails } from 'src/database/entities';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUserDetails => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
