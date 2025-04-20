import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { ListeningModule } from './listening/listening.module';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma.module';
import { ReadingModule } from './reading/reading.module';
import { SpellCorrectionModule } from './spell-correction/spell-correction.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';
import { WritingModule } from './writing/writing.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AdminModule,
    TestModule,
    ReadingModule,
    ListeningModule,
    WritingModule,
    PostModule,
    SpellCorrectionModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
