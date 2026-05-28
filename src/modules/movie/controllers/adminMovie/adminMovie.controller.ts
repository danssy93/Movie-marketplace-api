import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MovieService } from '../../services/movie/movie.service';
import { User } from 'src/database/entities/user.entity';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { ResponseFormat } from 'src/common/utils';
import { CreateMovieDto, UpdateMovieDto } from '../../dtos/createMovie.dto';
import { Admin } from 'src/database/entities';
import type { Response } from 'express';
import { AdminJwtGuard } from 'src/modules/admin-auth/guards/admin-jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { AdministratorType } from 'src/database/enums';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('AdminJWT')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdministratorType.ADMIN)
@Controller('movies')
export class AdminMovieController {
  private readonly logger = new Logger(AdminMovieController.name);
  constructor(private readonly movieService: MovieService) {}

  @Post('upload/admin')
  async createMovie(
    @Body() payload: CreateMovieDto,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const movie = await this.movieService.createMovie(payload, user, false);
    return ResponseFormat.success(res, 'Movie created successfully', movie);
  }

  @Patch('/status/:movieId')
  async updateMovieStatus(
    @Body() payload: UpdateMovieDto,
    @Res() res: Response,
    @Param('movieId', ParseIntPipe) movieId: string,
    @CurrentUser() admin: Admin,
  ) {
    const updatedMovie = await this.movieService.updateMovie(
      movieId,
      payload.status,
      admin,
    );
    return ResponseFormat.success(
      res,
      'Movie status updated successfully',
      updatedMovie,
    );
  }
}
