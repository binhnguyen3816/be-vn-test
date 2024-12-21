import { Module } from '@nestjs/common';
import { ReadingService } from './reading.service';

@Module({
  providers: [ReadingService],
})
export class ReadingModule {}
