import { Module } from '@nestjs/common';
import { UserAuthService } from './services/auth.service';
import { UserAuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { CustomerJwtGuard } from './guards/user-jwt.guard';
import { CustomerRefreshAuthGuard } from './guards/user-refresh-auth.guard';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { CustomerRefreshTokenStrategy } from './strategies/customer-refresh-token.strategy';
import { StringValue } from 'ms';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.ACCESS_SECRET as string,
        signOptions: {
          expiresIn: (process.env.ACCESS_EXPIRY_TIME || '1d') as StringValue,
        },
      }),
    }),
    UserModule,
  ],
  providers: [
    UserAuthService,
    CustomerJwtGuard,
    CustomerRefreshAuthGuard,
    CustomerJwtStrategy,
    CustomerRefreshTokenStrategy,
  ],
  controllers: [UserAuthController],
  exports: [UserAuthService],
})
export class UserAuthModule {}
