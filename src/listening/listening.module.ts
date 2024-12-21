import { Module } from '@nestjs/common';
import { ListeningService } from './listening.service';

@Module({
  providers: [ListeningService]
})
export class ListeningModule {}
