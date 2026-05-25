import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import AppError from 'src/common/error/AppError';
import { ErrorMessages } from 'src/database/enums/error-message.enum';
import { ManageAdminService } from 'src/modules/manage-admin/service';

@Injectable()
export class AdminRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'admin-refresh-token',
) {
  constructor(private readonly adminService: ManageAdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.adminService.findOneBy({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new AppError(ErrorMessages.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
