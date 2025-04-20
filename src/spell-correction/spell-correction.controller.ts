// spell-correction.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SpellCorrectionService } from './spell-correction.service';

@Controller('/v1/spell-correction')
export class SpellCorrectionController {
  constructor(private readonly spellCorrectionService: SpellCorrectionService) {}

  @Post()
  async correct(@Body('text') text: string) {
    const corrected = await this.spellCorrectionService.correctText(text);
    return { corrected };
  }
}
