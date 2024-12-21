import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  username: string;
  
  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  targetScore: number;

  @IsString()
  @IsOptional()
  examDate: Date;
}
