import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateTestDto } from '../dtos/create-test.dto';
import { CreatePartDto } from '../dtos/create-part.dto';
import { TestService } from '../test/test.service';
import { ListeningService } from '../listening/listening.service';
import { WritingService } from '../writing/writing.service';
import { ReadingService } from '../reading/reading.service';
import { CreateSubpartDto } from '../dtos/create-subpart.dto';
import { CreateQuestionDto } from '../dtos/create-question.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';

@Controller('v1/admin')
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly testService: TestService,
    private readonly readingService: ReadingService,
    private readonly writingService: WritingService,
    private readonly listeningService: ListeningService,
    private readonly userService: UserService,
  ) {}

  @Post('tests')
  async createTest(@Body() createTestDto: CreateTestDto) {
    return await this.testService.createTest(createTestDto);
  }

  @Post('/tests/:testId')
  async createPart(
    @Param('testId', ParseIntPipe) testId: number,
    @Body() createPartDto: CreatePartDto,
  ) {
    if (createPartDto.part === 'reading') {
      return await this.readingService.createReadingPart(testId, createPartDto);
    } else if (createPartDto.part === 'writing') {
      return await this.writingService.createWritingPart(testId, createPartDto);
    } else if (createPartDto.part === 'listening') {
      return await this.listeningService.createListeningPart(
        testId,
        createPartDto,
      );
    }
  }

  @Post('/tests/:testId/:part')
  async createSubpart(
    @Param('testId', ParseIntPipe) testId: number,
    @Param('part') part: string,
    @Body() createSubpartDto: CreateSubpartDto,
  ) {
    if (part === 'reading') {
      return await this.readingService.createReadingPassage(
        testId,
        createSubpartDto,
      );
    } else if (part === 'writing') {
      return await this.writingService.createWritingSubpart(
        testId,
        createSubpartDto,
      );
    } else if (part === 'listening') {
      return await this.listeningService.createListeningSubpart(
        testId,
        createSubpartDto,
      );
    }
  }
  @Post('/:part/:subpartId/questions')
  async createQuestion(
    @Param('part') part: string,
    @Param('subpartId', ParseIntPipe) subpartId: number,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    if (createQuestionDto.correctAnswer && !createQuestionDto.answers.includes(createQuestionDto.correctAnswer)) {
      throw new BadRequestException('Correct answer not included in answers');
    }
    if (part === 'reading') {
      return await this.readingService.createReadingQuestion(
        subpartId,
        createQuestionDto,
      );
    } else if (part === 'writing') {
      return await this.writingService.createWritingQuestion(
        subpartId,
        createQuestionDto,
      );
    } else if (part === 'listening') {
      return await this.listeningService.createListeningQuestion(
        subpartId,
        createQuestionDto,
      );
    }
  }
  @Get('users')
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }
  
  @Get('submissions')
  async getAllSubmissions() {
    return await this.testService.getAllSubmissions();
  }
  
}
