import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtDecodedToken } from 'src/common/interfaces';
import { UserAuthService } from '../services/auth.service';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  private readonly logger = new Logger(CustomerJwtStrategy.name);

  constructor(private readonly authService: UserAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_SECRET,
    });
  }

  async validate(payload: IJwtDecodedToken) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user || !user.is_active) {
      return new UnauthorizedException();
    }

    return user;
  }
}
