import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import AppError from 'src/common/error/AppError';
import { Request } from 'express';
import { UserAuthService } from '../services/auth.service';
import { IJwtDecodedToken } from 'src/common/interfaces';

@Injectable()
export class CustomerRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt-refresh',
) {
  constructor(private readonly authService: UserAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IJwtDecodedToken) {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const user = await this.authService.validateUser(payload.sub);

    if (!user || !user.is_active) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const storedRefreshToken = user.refresh_token;

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      throw new AppError(
        'Session expired, login again',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
