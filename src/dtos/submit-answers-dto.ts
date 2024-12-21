import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsNumber()
  @IsNotEmpty()
  questionId: number;

  @IsString()
  @IsNotEmpty()
  answerText: string;
}

export class SubmitAnswersDto {
  @IsNumber()
  @IsNotEmpty()
  testId: number;

  @IsNumber()
  @IsNotEmpty()
  completionTimeSeconds: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @IsOptional()
  readingAnswers: AnswerDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @IsOptional()
  listeningAnswers: AnswerDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @IsOptional()
  writingAnswers: AnswerDto[];
}
