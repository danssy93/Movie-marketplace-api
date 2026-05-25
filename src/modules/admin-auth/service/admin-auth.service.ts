import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ManageAdminService } from 'src/modules/manage-admin/service';
import { AdminLoginDto } from '../dto/login.dto';
import { ErrorMessages } from 'src/database/enums';
import AppError from 'src/common/error/AppError';
import { Admin } from 'src/database/entities/admin.entity';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly userService: ManageAdminService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userId: string) {
    const existingUser = await this.userService.findOne(
      {
        id: userId,
      },
      false,
    );

    if (!existingUser) {
      return null;
    }

    /*eslint-disable @typescript-eslint/no-unused-vars*/
    const { password, ...result } = existingUser;

    return result;
  }

  async login(loginDto: AdminLoginDto) {
    const { identifier, password } = loginDto;

    const existingUser = await this.userService.findOne([
      { email: identifier },
      { phone: identifier.replace(/\+/g, '') },
    ]);

    if (!existingUser) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND);
    }

    const user = existingUser as Admin;

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError(
        ErrorMessages.INVALID_CREDENTIALS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const accessTokenDetails = await this.generateAccessToken(user);
    const refreshTokenDetails = await this.generateRefreshToken(user);

    const payload = {
      ...user.toPayload(),
      access_token: accessTokenDetails,
      refresh_token: refreshTokenDetails,
    };

    await this.userService.update(
      { id: user.id },
      { refresh_token: refreshTokenDetails.refresh_token },
    );

    return {
      message: 'Login successful',
      payload,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userService.update({ id: userId }, { refresh_token: null });
  }

  async generateAccessToken(payload) {
    const data = {
      sub: payload.id,
      email: payload.email,
      phone: payload.phone,
      roles: payload.roles,
    };

    const options: JwtSignOptions = {
      secret: process.env.ACCESS_SECRET,
      expiresIn: (process.env.ACCESS_EXPIRY_TIME || '1d') as any,
    };

    const accessToken = await this.jwtService.signAsync(data, options);

    return {
      type: 'Bearer',
      access_token: accessToken,
      expiresIn: process.env.ACCESS_EXPIRY_TIME || '1d',
    };
  }

  async generateRefreshToken(payload) {
    const data = {
      sub: payload.id,
      email: payload.email,
      phone: payload.phone,
      roles: payload.roles,
    };

    const options: JwtSignOptions = {
      secret: process.env.REFRESH_SECRET,
      expiresIn: (process.env.REFRESH_EXPIRY_TIME || '7d') as any,
    };
    const refreshToken = await this.jwtService.signAsync(data, options);

    return {
      type: 'Bearer',
      refresh_token: refreshToken,
      expiresIn: process.env.ACCESS_EXPIRY_TIME || '7d',
    };
  }
}
