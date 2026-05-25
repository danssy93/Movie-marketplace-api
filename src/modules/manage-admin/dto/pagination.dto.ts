import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { IsDateFormat } from 'src/common/constraints/validate-date';

export class ExportPaginationDto {
  @IsDateFormat('yyyy-mm-dd', {
    message: 'Start date must be in yyyy-mm-dd format',
  })
  @ApiProperty({
    description: 'Start date',
    example: '2024-01-01',
    required: true,
    title: 'start_date',
    default: '2024-01-01',
  })
  readonly start_date: string;

  @IsDateFormat('yyyy-mm-dd', {
    message: 'End date must be in yyyy-mm-dd format',
  })
  @ApiProperty({
    description: 'End date',
    example: '2024-12-31',
    required: true,
    title: 'end_date',
    default: '2024-12-31',
  })
  readonly end_date: string;
}

export class BasePaginationDto {
  @IsNumber({ allowNaN: false })
  @Min(1, { message: 'Page number must be at least 1' })
  @Type(() => Number)
  @ApiProperty({
    description: 'Page Number',
    example: 1,
    required: true,
    title: 'page',
    default: 1,
  })
  readonly page: number;

  @IsNumber({ allowNaN: false })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @Type(() => Number)
  @ApiProperty({
    description: 'Size of data',
    example: 10,
    required: true,
    title: 'limit',
    default: 10,
  })
  readonly limit: number;
}

export class BasePaginationWithDateDto extends BasePaginationDto {
  @IsOptional()
  @IsDateFormat('yyyy-mm-dd', {
    message: 'Start date must be in yyyy-mm-dd format',
  })
  @ApiProperty({
    description: 'Start date',
    example: '2024-01-01',
    required: false,
    title: 'start_date',
    default: '2024-01-01',
  })
  readonly start_date?: string;

  @IsOptional()
  @IsDateFormat('yyyy-mm-dd', {
    message: 'End date must be in yyyy-mm-dd format',
  })
  @ApiProperty({
    description: 'End date',
    example: '2024-12-31',
    required: false,
    title: 'end_date',
    default: '2024-12-31',
  })
  readonly end_date?: string;
}

export class AdvancedBasePaginationDto extends BasePaginationWithDateDto {
  @IsOptional()
  @IsNumber({ allowNaN: false })
  @ApiProperty({
    description: 'Transaction Amount',
    example: '2000',
    required: false,
    title: 'amount',
    default: '1500',
  })
  readonly amount?: number;
}

export class CmsFilterByUserPaginationDto extends AdvancedBasePaginationDto {
  @IsOptional()
  @IsString({ message: 'User ID must be a valid string' })
  @ApiProperty({
    description: 'User ID',
    example: '740804e8-3001-7040-3e5a-69bba8e88a7e',
    required: false,
    title: 'user',
  })
  user_id?: string;
}
