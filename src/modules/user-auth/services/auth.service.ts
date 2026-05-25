import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ICurrentUserDetails, User } from 'src/database/entities';
import { UserService } from 'src/modules/user/services/user.service';
import { LoginDto } from '../dto/login.dto';
import { Role } from 'src/database/enums';
import { In } from 'typeorm';

@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(userId: string): Promise<ICurrentUserDetails> {
    const existingUser = await this.userService.findOne({ id: userId }, false);

    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: existingUser.id!,
      phone: existingUser.phone!,
      email: existingUser.email!,
      created_at: existingUser?.created_at!,
      full_name: existingUser.full_name!,
      refresh_token: existingUser?.refresh_token!,
      is_active: existingUser?.is_active ?? false,
      roles: existingUser?.roles || [],
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;

    const normalizedIdentifier = identifier.replace(/\+/g, '');

    const existingUser = await this.userService.findOne(
      [
        {
          email: identifier,
          roles: In([Role.CUSTOMER, Role.AUTHOR]),
        },
        {
          phone: normalizedIdentifier,
          roles: In([Role.CUSTOMER, Role.AUTHOR]),
        },
      ],
      true,
    );

    if (!existingUser) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const comparePass = await existingUser.comparePassword(password);

    if (!comparePass) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = await this.generateAccessToken(existingUser);
    const refreshToken = await this.generateRefreshToken(existingUser);

    if (!existingUser.id) {
      throw new HttpException(
        'User ID missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const payload = {
      ...existingUser.toPayload(),
      accessToken: accessToken.access_token,
      refreshToken: refreshToken.refresh_token,
    };

    await this.userService.update(
      { id: existingUser.id },
      {
        refresh_token: refreshToken.refresh_token,
      },
    );

    return {
      status: HttpStatus.OK,
      message: 'Login successful',
      data: payload,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userService.update({ id: userId }, { refresh_token: null });
  }

  async generateAccessToken(payload: Partial<User>) {
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

  async generateRefreshToken(payload: Partial<User>) {
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
      expiresIn: process.env.REFRESH_EXPIRY_TIME || '7d',
    };
  }
}
