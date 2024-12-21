import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['reading', 'writing', 'listening'], {
    message: 'Part must be either reading, writing or listening',
  })
  part: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsNumber()
  @IsOptional()
  totalQuestion: number;

  @IsString()
  @IsOptional()
  audioUrl: string;
}
