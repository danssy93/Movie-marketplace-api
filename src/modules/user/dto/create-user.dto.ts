import { PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
  IsArray,
  IsEnum,
  ArrayNotEmpty,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/database/enums';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    title: 'Name',
    required: true,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required.' })
  @Matches(/^[^\s]+$/, { message: 'Name cannot contain whitespace.' })
  full_name: string;

  @ApiProperty({
    example: 'john@example.com',
    title: 'Email',
    required: true,
  })
  @IsEmail()
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required.' })
  @Matches(/^[^\s]+$/, { message: 'Email cannot contain whitespace.' })
  email: string;

  @ApiProperty({
    example: '+2348012345678',
    title: 'Phone',
    required: true,
  })
  @IsPhoneNumber()
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required.' })
  @Matches(/^[^\s]+$/, { message: 'Email cannot contain whitespace.' })
  phone: string;

  @ApiProperty({
    example: '123456',
    required: true,
    title: 'Change Password',
  })
  @IsNotEmpty({ message: 'Old Password is required' })
  @IsString({ message: 'Old Password must be a string' })
  @Matches(/^[^\s]+$/, { message: 'Old Password cannot contain whitespace.' })
  @MinLength(6, { message: 'Old Password must be at least 4 characters long.' })
  readonly password: string;

  @ApiProperty({ example: Object.values(Role), required: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  refreshToken?: string | null;
}
