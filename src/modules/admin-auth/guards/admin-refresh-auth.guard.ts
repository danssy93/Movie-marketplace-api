import { Injectable } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminRefreshAuthGuard extends NestAuthGuard('admin-refresh-jwt') {}
