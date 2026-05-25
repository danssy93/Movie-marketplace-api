import {
  Body,
  Controller,
  Get,
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

@Controller('upload')
export class UserMovieController {
  private readonly logger = new Logger(UserMovieController.name);
  constructor(private readonly movieService: MovieService) {}

  @UseGuards(CustomerJwtGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Post('author')
  async createMovie(
    @Body() payload: CreateMovieDto,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const movie = await this.movieService.createMovie(payload, user);
    return ResponseFormat.success(res, 'Movie created successfully', movie);
  }

  @Get('movies')
  async getMovies(@Res() res: Response) {
    const movies = await this.movieService.getMovies();
    return ResponseFormat.success(res, 'Movies retrieved successfully', movies);
  }
}
