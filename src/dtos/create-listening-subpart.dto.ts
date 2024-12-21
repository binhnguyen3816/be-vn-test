import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateListeningSubpart {
  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
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
