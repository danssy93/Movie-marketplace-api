import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MovieGenre, MovieStatus } from 'src/database/entities/movie.entity';

export class CreateMovieDto {
  @ApiProperty({ example: 'The Dark Knight' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A movie about batman...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  duration?: number; // in minutes

  @ApiProperty({ example: MovieGenre.ACTION, enum: MovieGenre })
  @IsEnum(MovieGenre)
  @IsOptional()
  genre?: MovieGenre;

  @ApiProperty({ example: 'https://url-to-thumbnail.com/image.jpg' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @ApiProperty({ example: 'https://url-to-video.com/video.mp4' })
  @IsString()
  @IsOptional()
  video_url?: string;
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @ApiProperty({ example: MovieStatus.PUBLISHED, enum: MovieStatus })
  @IsEnum(MovieStatus)
  @IsOptional()
  status: MovieStatus;
}

export class MovieFilterDto {
  @ApiProperty({ example: MovieGenre.ACTION, required: false })
  @IsEnum(MovieGenre)
  @IsOptional()
  genre: MovieGenre;

  @ApiProperty({ example: MovieStatus.PUBLISHED, required: false })
  @IsEnum(MovieStatus)
  @IsOptional()
  status: MovieStatus;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @ApiProperty({ example: '2026-12-01', required: false })
  @IsOptional()
  release_date: Date;
}
