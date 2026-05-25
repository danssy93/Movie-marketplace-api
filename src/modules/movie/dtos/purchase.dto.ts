import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class PurchaseMovieDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the movie to purchase',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  movie_id: number;
}
