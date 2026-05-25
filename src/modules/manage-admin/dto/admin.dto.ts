import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsEmail,
  IsArray,
  ArrayNotEmpty,
  IsIn,
  IsEnum,
} from 'class-validator';
import { AdministratorType } from 'src/database/enums';

export class CreateAdminDto {
  @ApiProperty({ example: 'John Doe', required: true })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required.' })
  @Matches(/^[^\s]+$/, { message: 'Name cannot contain whitespace.' })
  full_name: string;

  @ApiProperty({ example: 'john@example.com', required: true })
  @IsEmail()
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required.' })
  @Matches(/^[^\s]+$/, { message: 'Email cannot contain whitespace.' })
  email: string;

  @ApiProperty({ example: '+1234567890', required: true })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required.' })
  phone: string;

  @ApiProperty({ example: 'P@ssw0rd', required: true })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required.' })
  @Matches(/^[^\s]+$/, { message: 'Password cannot contain whitespace.' })
  password: string;

  @ApiProperty({ example: Object.values(AdministratorType), required: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AdministratorType, { each: true })
  roles: AdministratorType[];
}

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiProperty({
    example: '12',
    title: 'User ID',
    required: true,
  })
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required.' })
  user_id: string;
}
