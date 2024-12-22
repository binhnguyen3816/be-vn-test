import { IsString, IsNotEmpty, IsEnum, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsArray()
  @IsEnum(['Overall', 'Listening', 'Reading', 'Writing', 'Speaking', 'News'], {
    each: true,
    message:
      'Tags must be either Overall, Listening, Reading, Writing, Speaking or News',
  })
  tags: string[];
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
