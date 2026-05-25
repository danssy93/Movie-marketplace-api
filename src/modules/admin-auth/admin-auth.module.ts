import { Module } from '@nestjs/common';
import { AdminJwtStrategy, AdminRefreshTokenStrategy } from './strategies';
import { AdminAuthService } from './service/admin-auth.service';
import { AdminAuthController } from './controller/admin-auth.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ManageAdminModule } from '../manage-admin/manage-admin.module';
import { StringValue } from 'ms';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: (process.env.ACCESS_EXPIRY_TIME || '1d') as StringValue,
        },
      }),
    }),
    ManageAdminModule,
  ],
  providers: [AdminAuthService, AdminJwtStrategy, AdminRefreshTokenStrategy],
  controllers: [AdminAuthController],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
