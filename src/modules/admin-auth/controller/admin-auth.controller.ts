import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthService } from '../service/admin-auth.service';
import { AdminLoginDto } from '../dto';
import type { Response } from 'express';
import { ResponseFormat } from 'src/common/utils';
import { Public } from '../strategies';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { User } from 'src/database/entities/user.entity';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { AdminRefreshAuthGuard } from '../guards/admin-refresh-auth.guard';
import AppError from 'src/common/error/AppError';
import { RolesGuard } from 'src/common/guards/role.guard';

@Controller('auth/admin')
export class AdminAuthController {
  private readonly logger = new Logger(AdminAuthController.name);

  constructor(private readonly authService: AdminAuthService) {}

  @ApiOperation({
    summary: 'Admin Authentication',
    description: 'Validate login credential and provide auth token',
  })
  @ApiOkResponse({
    description: 'Login successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBody({
    type: AdminLoginDto,
    description: 'Login details',
  })
  @Public()
  @Post('login')
  async login(@Body() loginDto: AdminLoginDto, @Res() res: Response) {
    const { message, payload } = await this.authService.login(loginDto);

    if (!payload) {
      throw new AppError('Login failed', HttpStatus.UNAUTHORIZED);
    }
    return ResponseFormat.success(res, message, payload);
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
  @ApiBearerAuth('admin-refresh-jwt')
  @UseGuards(AdminRefreshAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Res() res: Response, @CurrentUser() user: User) {
    const result = await this.authService.generateRefreshToken(user);

    if (!result) {
      return ResponseFormat.failure(
        res,
        'Token refresh failed',
        HttpStatus.UNAUTHORIZED,
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
  @ApiBearerAuth('AdminJWT')
  @UseGuards(AdminJwtGuard)
  @Post('logout')
  async logout(@Res() res: Response, @CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return ResponseFormat.success(res, 'Logout successful', null);
  }
}
