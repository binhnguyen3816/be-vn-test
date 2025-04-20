import { Module } from '@nestjs/common';
import { SpellCorrectionService } from './spell-correction.service';
import { SpellCorrectionController } from './spell-correction.controller';

@Module({
  providers: [SpellCorrectionService],
  controllers: [SpellCorrectionController]
})
export class SpellCorrectionModule {}
