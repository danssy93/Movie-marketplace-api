import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from 'src/common/guards/current-user.guard';
import { ResponseFormat } from 'src/common/utils';
import { CustomerJwtGuard } from 'src/modules/user-auth/guards/user-jwt.guard';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@ApiTags('User Module')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.create(createUserDto);
    return ResponseFormat.success(res, 'User created successfully', user);
  }

  @Get()
  async findAll(@Res() res: Response) {
    const users = await this.userService.find();
    return ResponseFormat.success(res, 'Users retrieved successfully', users);
  }

  @ApiOperation({
    summary: 'Get Profile',
    description: 'Fetches the profile details of the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Profile retrieved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request due to invalid input or processing error.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  @ApiBearerAuth('CustomerJWT')
  @UseGuards(CustomerJwtGuard)
  @Get('profile')
  async profile(@Res() res: Response, @CurrentUser() user) {
    const result = {
      id: user.id,
      first_name: user?.first_name,
      last_name: user?.last_name,
      other_name: user?.other_name,
      phone: `+${user.phone}`,
      email: user.email,
      gender: user?.gender,
      dob: user?.dob,
      created_at: user?.created_at,
    };

    return ResponseFormat.success(res, 'Successful', result);
  }
}
