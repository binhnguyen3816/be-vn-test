import { Body, Controller, Post } from '@nestjs/common';
import { CreateEssayDto } from './dto/create-essay.dto';
import { ScoringService } from './scoring.service';

@Controller('/v1/scoring')
export class ScoringController {
  constructor(private readonly gradingService: ScoringService) {}

  @Post()
  async grade(@Body() createEssayDto: CreateEssayDto) {
    return await this.gradingService.gradeEssay(createEssayDto.essay, createEssayDto.question);
  }
}
