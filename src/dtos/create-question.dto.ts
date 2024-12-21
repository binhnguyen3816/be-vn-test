import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateQuestionDto {
    @IsNumber()
    @IsOptional()
    questionNumber: number;

    @IsString()
    @IsNotEmpty()
    questionText: string;

    
    @IsArray()
    @IsOptional()
    answers: [string];

    
    @IsString()
    @IsOptional()
    correctAnswer: string;
}
