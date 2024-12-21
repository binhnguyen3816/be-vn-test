import { Module } from '@nestjs/common';
import { WritingService } from './writing.service';

@Module({
  providers: [WritingService]
})
export class WritingModule {}
