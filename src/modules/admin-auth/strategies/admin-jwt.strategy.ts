import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Logger } from '@nestjs/common';
import { AdminAuthService } from '../service/admin-auth.service';
import { IJwtDecodedToken } from 'src/common/interfaces';
import AppError from 'src/common/error/AppError';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  private readonly logger = new Logger(AdminJwtStrategy.name);

  constructor(private readonly authService: AdminAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_SECRET,
    });
  }

  async validate(payload: IJwtDecodedToken) {
    console.log('🔍 JWT payload =', payload);
    const user = await this.authService.validateUser(payload.sub);

    console.log('🔍 validated user =', user);
    if (!user) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
