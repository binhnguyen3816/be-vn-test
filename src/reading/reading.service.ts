import { UserTestResult } from './../../node_modules/.prisma/client/index.d';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePartDto } from 'src/dtos/create-part.dto';
import { CreateQuestionDto } from 'src/dtos/create-question.dto';
import { CreateReadingPassageDto } from 'src/dtos/create-reading-passage.dto';
import { PrismaService } from 'src/prisma.service';
import { SubmitAnswersDto } from 'src/dtos/submit-answers-dto';
import { UpdateTestResultDto } from 'src/dtos/update-test-result.dto';

@Injectable()
export class ReadingService {
  constructor(private readonly prisma: PrismaService) {}

  async createReadingPart(testId: number, createReadingPartDto: CreatePartDto) {
    await this.validateTest(testId);
    await this.checkUniqueReadingPart(testId);
    const newPart = await this.prisma.readingTest.create({
      data: {
        testId: testId,
        description: createReadingPartDto.description,
        duration: createReadingPartDto.duration,
        totalQuestions: createReadingPartDto.totalQuestion,
      },
    });
    return { partId: newPart.id };
  }
  async createReadingPassage(
    testId: number,
    createReadingPassageDto: CreateReadingPassageDto,
  ) {
    await this.validateTest(testId);
    const readingTest = await this.findReadingTest(testId);
    const newPassage = await this.prisma.readingPassage.create({
      data: {
        readingTestId: readingTest.id,
        readingPassage: createReadingPassageDto.passage,
        title: createReadingPassageDto.title,
        description: createReadingPassageDto.description,
        duration: createReadingPassageDto.duration,
        totalQuestions: createReadingPassageDto.totalQuestions,
      },
    });
    return { subpartId: newPassage.id };
  }
  async createReadingQuestion(
    subpartId: number,
    createQuestionDto: CreateQuestionDto,
  ) {
    await this.validateReadingPassage(subpartId);
    const newQuestion = await this.prisma.readingQuestion.create({
      data: {
        readingPassageId: subpartId,
        questionNumber: createQuestionDto.questionNumber,
        questionText: createQuestionDto.questionText,
      },
    });
    await this.createReadingQuestionOptions(newQuestion.id, createQuestionDto);
    return { questionId: newQuestion.id };
  }
  async createReadingQuestionOptions(
    questionId: number,
    createQuestionDto: CreateQuestionDto,
  ) {
    await this.prisma.readingQuestionOption.createMany({
      data: createQuestionDto.answers.map((answer, index) => {
        return {
          readingQuestionId: questionId,
          optionLabel: ['A', 'B', 'C', 'D'][index],
          optionText: answer,
          isCorrect: createQuestionDto.correctAnswer === answer ? true : false,
        };
      }),
    });
  }
  async getReadingTestById(testId: number) {
    const readingTest = await this.prisma.readingTest.findFirst({
      where: { id: testId },
    });
    if (readingTest) {
      return { part: 'reading', ...readingTest };
    }
  }

  async getReadingQuestions(testId: number) {
    const readingTest = await this.findReadingTest(testId);
    const readingPassages = await this.findReadingPassages(readingTest.id);

    return await Promise.all(
      readingPassages.map(async (passage) => ({
        ...passage,
        questions: await this.getReadingQuestionsOfPassage(passage.id),
      })),
    );
  }
  async getReadingQuestionsOfPassage(readingPassageId: number) {
    const readingQuestions = await this.findReadingQuestions(readingPassageId);
    return await Promise.all(
      readingQuestions.map(async (question) => ({
        ...question,
        options: await this.getReadingQuestionOptions(question.id),
      })),
    );
  }
  async getReadingQuestionOptions(questionId: number) {
    const readingQuestionOptions =
      await this.prisma.readingQuestionOption.findMany({
        where: { readingQuestionId: questionId },
      });
    if (!readingQuestionOptions) {
      throw new NotFoundException('Reading question options not found');
    }
    return readingQuestionOptions;
  }
  async createReadingAnswers(
    userTestResultId: number,
    submitAnswersDto: SubmitAnswersDto,
  ) {
    const { testId, completionTimeSeconds, readingAnswers, listeningAnswers, writingAnswers } = submitAnswersDto;
    const readingQuestions = await this.findReadingQuestionsOfTest(testId);
    const AnswerData = [];
    for (const question of readingQuestions) {
      const selectedOption = this.findAnswerText(question.id, readingAnswers);
      const isCorrect = selectedOption !== null && selectedOption !== undefined
        ? question.options.some(
            (option: any) => option.optionText === selectedOption && option.isCorrect
          )
        : false;

      AnswerData.push({
        userTestResultId: userTestResultId,
        questionType: 'reading',
        readingQuestionId: question.id,
        selectedOption: selectedOption || null,
        isCorrect: isCorrect,
      });
    }

    await this.prisma.userAnswer.createMany({
      data: AnswerData,
    });

    return AnswerData;
  }
  async updateReadingTestResult(userTestResultId: number, AnswerData: UpdateTestResultDto[], completionTimeSeconds: number) {
    const numberOfCorrectAnswers = AnswerData.filter(
      (answer) => answer.isCorrect,
    ).length;
    const numberOfSelectedOptions = AnswerData.filter(
      (answer) => answer.selectedOption !== null,
    ).length;

    const updatedTestResult = await this.prisma.userTestResult.update({
      where: { id: userTestResultId },
      data: {
        totalCorrect: numberOfCorrectAnswers,
        totalIncorrect: numberOfSelectedOptions - numberOfCorrectAnswers,
        completionTimeSeconds: completionTimeSeconds,
        score: (numberOfCorrectAnswers / AnswerData.length) * 100,
      },
    })
    return updatedTestResult
  }
  async submitReadingPart(userTestResultId: number, submitAnswersDto: SubmitAnswersDto) {
    const { testId, completionTimeSeconds, readingAnswers, listeningAnswers, writingAnswers } = submitAnswersDto;
    const AnswerData = await this.createReadingAnswers(
      userTestResultId,
      submitAnswersDto,
    );
    await this.updateReadingTestResult(userTestResultId, AnswerData, completionTimeSeconds);

    return {
      submissionId: userTestResultId,
      status: 'submitted',
      submittedAt: new Date(),
    };
  }
  async getReadingTestResult(readingTestId: number) {
    const readingTestResult = await this.prisma.userTestResult.findFirst({
      where: { readingTestId: readingTestId },
    })
    return readingTestResult
  }
  // helper function to find answer
  private findAnswerText(questionId: number, answers: any) {
    const answer = answers.find(
      (answer: any) => answer.questionId === questionId,
    );
    return answer?.answerText;
  }
  // helper function to find reading questions
  async findReadingQuestionsOfTest(testId: number) {
    const readingQuestions = await this.getReadingQuestions(testId);
    const questionList = [];

    for (const readingQuestion of readingQuestions) {
      const questions = await this.getReadingQuestionsOfPassage(
        readingQuestion.id,
      );
      // Use Array.flat() if answers might be nested arrays
      questionList.push(...questions.flat());
    }
    return questionList;
  }
  // Helper function to check if test exists
  private async validateTest(testId: number) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId },
    });
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }
  // Helper function to find reading test
  private async findReadingTest(subpartId: number) {
    const readingTest = await this.prisma.readingTest.findFirst({
      where: { testId: subpartId },
    });
    if (!readingTest) {
      throw new NotFoundException('Reading subpart not found');
    }
    return readingTest;
  }
  // Helper function to check if reading part is unique
  private async checkUniqueReadingPart(testId: number) {
    const readingTest = await this.prisma.readingTest.findFirst({
      where: { testId: testId },
    });
    if (readingTest) {
      throw new BadRequestException('Reading part already exists in the test');
    }
  }
  // Helper function to validate reading passage
  private async validateReadingPassage(subpartId: number) {
    const readingPassage = await this.prisma.readingPassage.findFirst({
      where: { id: subpartId },
    });
    if (!readingPassage) {
      throw new NotFoundException('Reading passage not found');
    }
    return readingPassage;
  }
  // Helper function to find reading passages of a reading test
  private async findReadingPassages(readingTestId: number) {
    const readingPassages = await this.prisma.readingPassage.findMany({
      where: { readingTestId: readingTestId },
    });
    if (!readingPassages) {
      throw new NotFoundException('Reading passage not found');
    }
    return readingPassages;
  }
  // Helper function to find reading questions of a reading passage
  private async findReadingQuestions(readingPassageId: number) {
    const readingQuestions = await this.prisma.readingQuestion.findMany({
      where: { readingPassageId: readingPassageId },
    });
    if (!readingQuestions) {
      throw new NotFoundException('Reading questions not found');
    }
    return readingQuestions;
  }
}
