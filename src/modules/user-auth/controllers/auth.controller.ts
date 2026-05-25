import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import type { Response } from 'express';
import AppError from 'src/common/error/AppError';
import { ResponseFormat } from 'src/common/utils/ResponseFormat';
import { Public } from 'src/modules/admin-auth/strategies/public.strategy';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/common/guards/current-user.guard';
import { User } from 'src/database/entities';
import { CustomerJwtGuard } from '../guards/user-jwt.guard';
import { CustomerRefreshAuthGuard } from '../guards/user-refresh-auth.guard';

@Controller('auth/user')
export class UserAuthController {
  private readonly logger = new Logger(UserAuthController.name);

  constructor(private readonly authService: UserAuthService) {}

  @ApiOperation({
    summary: 'user Authentication',
    description: 'Validate login credential and provide auth token',
  })
  @ApiOkResponse({
    description: 'Login successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Login details',
  })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { message, data } = await this.authService.login(loginDto);
    if (!data) {
      throw new AppError('Login failed', HttpStatus.UNAUTHORIZED);
    }
    return ResponseFormat.success(res, message, data);
  }

  @ApiOkResponse({
    description: 'Token refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'User record not found',
  })
  @ApiBearerAuth('customer-refresh-jwt')
  @UseGuards(CustomerRefreshAuthGuard)
  @Post('refresh_token')
  async refreshToken(@Res() res: Response, @CurrentUser() user: User) {
    const result = await this.authService.generateRefreshToken(user);
    if (!result) {
      return (
        ResponseFormat.failure(res, 'Token refresh failed'),
        HttpStatus.UNAUTHORIZED
      );
    }
    return ResponseFormat.success(res, 'Token refreshed successfully', result);
  }

  @ApiOperation({
    summary: 'Deactivate customer token',
    description: 'Logout customer and blacklist token',
  })
  @ApiOkResponse({
    description: 'Deactivation/Logout successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid user',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or required parameters missing.',
  })
  @ApiBearerAuth('customer-jwt')
  @UseGuards(CustomerJwtGuard)
  @Post('logout')
  async logout(@Res() res: Response, @CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return ResponseFormat.success(res, 'Logout successful', null);
  }
}
