import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TestService } from '../test/test.service';
import { TestModule } from '../test/test.module';
import { ReadingModule } from '../reading/reading.module';
import { ReadingService } from '../reading/reading.service';
import { ListeningService } from '../listening/listening.service';
import { WritingService } from '../writing/writing.service';
import { UserService } from './user.service';

@Module({
  imports: [TestModule],
  controllers: [UserController],
  providers: [TestService, ReadingService, ListeningService, WritingService, UserService],
})
export class UserModule {}
