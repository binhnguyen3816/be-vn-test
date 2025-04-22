import { IsString } from 'class-validator';

export class CreateEssayDto {
  @IsString()
  essay: string;

  @IsString()
  question: string;
}