import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTestResultDto {
  @IsNumber()
  userTestResultId: number;

  @IsString()
  questionType: string;

  @IsNumber()
  readingQuestionId: number;

  @IsOptional()
  @IsString()
  selectedOption?: string | null;

  @IsOptional()
  @IsString()
  writingText?: string | null;

  @IsBoolean()
  isCorrect: boolean;

  @IsNumber()
  point: number;
}
