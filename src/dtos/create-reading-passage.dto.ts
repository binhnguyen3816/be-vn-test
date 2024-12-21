import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsOptional,
  } from 'class-validator';
  
  export class CreateReadingPassageDto {
    @IsString()
    @IsOptional()
    description: string;
  
    @IsString()
    @IsNotEmpty()
    title: string;
  
    @IsString()
    @IsNotEmpty()
    passage?: string;
  
    @IsString()
    @IsOptional()
    imageUrl?: string;
  
    @IsNumber()
    @IsOptional()
    duration?: number;
  
    @IsNumber()
    @IsOptional()
    point?: number;
  
    @IsNumber()
    @IsOptional()
    totalQuestions?: number;
  }
  