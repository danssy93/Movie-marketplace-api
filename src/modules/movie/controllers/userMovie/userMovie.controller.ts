import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { ResponseFormat } from 'src/common/utils';
import { User } from 'src/database/entities';
import { Role } from 'src/database/enums';
import { CustomerJwtGuard } from 'src/modules/user-auth/guards/user-jwt.guard';
import { CreateMovieDto } from '../../dtos/createMovie.dto';
import { MovieService } from '../../services/movie/movie.service';
import type { Response } from 'express';
import { TransactionStatus } from 'src/modules/wallet/enum/wallet.enum';
import { PurchaseMovieDto } from '../../dtos/purchase.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('movies')
export class UserMovieController {
  private readonly logger = new Logger(UserMovieController.name);
  constructor(private readonly movieService: MovieService) {}

  @ApiBearerAuth('CustomerJWT')
  @UseGuards(CustomerJwtGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Post('upload/author')
  async createMovie(
    @Body() payload: CreateMovieDto,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const movie = await this.movieService.createMovie(payload, user, true);
    return ResponseFormat.success(res, 'Movie created successfully', movie);
  }

  @Get('movies')
  async getMovies(@Res() res: Response) {
    const movies = await this.movieService.getMovies();
    return ResponseFormat.success(res, 'Movies retrieved successfully', movies);
  }

  @ApiBearerAuth('CustomerJWT')
  @UseGuards(CustomerJwtGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('purchase')
  async purchase(
    @Body() purchaseMovieDto: PurchaseMovieDto,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const { message, status, payload } = await this.movieService.purchaseMovie(
      purchaseMovieDto,
      user,
    );

    if (status == TransactionStatus.SUCCESSFUL) {
      return ResponseFormat.success(res, message, payload);
    }

    if (status == TransactionStatus.IN_PROGRESS) {
      return ResponseFormat.success(res, message, payload);
    }

    return ResponseFormat.success(
      res,
      message,
      payload,
      HttpStatus.EXPECTATION_FAILED,
    );
  }
}
