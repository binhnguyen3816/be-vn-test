import { CreateQuestionDto } from 'src/dtos/create-question.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePartDto } from 'src/dtos/create-part.dto';
import { CreateWritingSubpartDto } from 'src/dtos/create-writing-subpart.dto';
import { PrismaService } from 'src/prisma.service';
import { SubmitAnswersDto } from 'src/dtos/submit-answers-dto';
import { UpdateTestResultDto } from 'src/dtos/update-test-result.dto';
import { create } from 'domain';

@Injectable()
export class WritingService {
  constructor(private readonly prisma: PrismaService) {}

  async createWritingPart(testId: number, createPartDto: CreatePartDto) {
    await this.validateTest(testId);
    await this.checkUniqueWritingPart(testId);

    const newPart = await this.prisma.writingTest.create({
      data: {
        testId: testId,
        description: createPartDto.description,
        duration: createPartDto.duration,
        totalQuestions: createPartDto.totalQuestion,
      },
    });
    return { partId: newPart.id };
  }
  async createWritingSubpart(
    testId: number,
    createWritingSubpartDto: CreateWritingSubpartDto,
  ) {
    await this.validateTest(testId);
    const writingTest = await this.findWritingTest(testId);

    const newSubpart = await this.prisma.writingSubpart.create({
      data: {
        writingTestId: writingTest.id,
        title: createWritingSubpartDto.title,
        description: createWritingSubpartDto.description,
        writingPassage: createWritingSubpartDto.passage,
        point: createWritingSubpartDto.point,
        duration: createWritingSubpartDto.duration,
        totalQuestions: createWritingSubpartDto.totalQuestions,
      },
    });
    return { subpartId: newSubpart.id };
  }
  async createWritingQuestion(
    subpartId: number,
    createQuestionDto: CreateQuestionDto,
  ) {
    await this.validateWritingSubpart(subpartId);
    const newQuestion = await this.prisma.writingQuestion.create({
      data: {
        writingSubpartId: subpartId,
        question: createQuestionDto.questionText,
      },
    });
    await this.createWritingQuestionOptions(newQuestion.id, createQuestionDto);
    return { questionId: newQuestion.id };
  }
  async createWritingQuestionOptions(
    questionId: number,
    createQuestionDto: CreateQuestionDto,
  ) {
    const newOptions = await this.prisma.writingQuestionOption.createMany({
      data: createQuestionDto.answers
        ? createQuestionDto.answers.map((answer, index) => {
            return {
              writingQuestionId: questionId,
              optionLabel: ['A', 'B', 'C', 'D'][index],
              optionText: answer,
              isCorrect:
                createQuestionDto.correctAnswer === answer ? true : false,
            };
          })
        : [],
    });
  }
  async getWritingTestById(testId: number) {
    const writingTest = await this.prisma.writingTest.findFirst({
      where: { id: testId },
    });
    if (writingTest) {
      return { part: 'writing', ...writingTest };
    }
  }

  async getWritingQuestions(testId: number) {
    const writingTest = await this.findWritingTest(testId);
    const writingSubparts = await this.findWritingSubparts(writingTest.id);
    return await Promise.all(
      writingSubparts.map(async (writingSubpart) => ({
        ...writingSubpart,
        questions: await this.getWritingQuestionsOfSubpart(writingSubpart.id),
      })),
    );
  }
  async getWritingQuestionsOfSubpart(subpartId: number) {
    const writingSubparts = await this.findWritingQuestions(subpartId);
    return await Promise.all(
      writingSubparts.map(async (writingQuestion) => ({
        ...writingQuestion,
        options: await this.getWritingQuestionOptions(writingQuestion.id),
      })),
    );
  }
  async getWritingQuestionOptions(questionId: number) {
    const writingQuestionOptions =
      await this.prisma.writingQuestionOption.findMany({
        where: { writingQuestionId: questionId },
      });
    if (writingQuestionOptions) {
      return writingQuestionOptions;
    }
  }
  async createWritingAnswers(
    userTestResultId: number,
    submitAnswersDto: SubmitAnswersDto,
  ) {
    const { testId, completionTimeSeconds, readingAnswers, listeningAnswers, writingAnswers } = submitAnswersDto;
    const writingQuestions = await this.findWritingQuestionsOfTest(testId);
    const answerData = [];

    for (const question of writingQuestions) {
      const answerText = this.findAnswerText(question.id, writingAnswers);
      if (question.options.length === 0) {
        answerData.push({
          userTestResultId,
          questionType: 'writing',
          writingQuestionId: question.id,
          selectedOption: null,
          writingText: answerText,
          isCorrect: answerText ? true : false,
          point: question.point,
        });
      } else {
        answerData.push({
          userTestResultId,
          questionType: 'writing',
          writingQuestionId: question.id,
          selectedOption: answerText,
          writingText: null,
          isCorrect: answerText
            ? question.options.find(
                (option) => option.optionText === answerText,
              ).isCorrect
            : false,
          point: question.point,
        });
      }
    }

    await this.prisma.userAnswer.createMany({
      data: answerData,
    });

    return answerData;
  }

  async updateWritingTestResult(
    userTestResultId: number,
    answerData: UpdateTestResultDto[],
    completionTimeSeconds: number,
  ) {
    const numberOfCorrectAnswers = answerData.filter(
      (answer) => answer.isCorrect,
    ).length;
    const numberOfSelectedOptions = answerData.filter(
      (answer) => answer.selectedOption !== null || answer.writingText !== null,
    ).length;
    const score = answerData.reduce((acc, answer) => (answer.isCorrect ? acc + answer.point : acc), 0);
    const updatedTestResult = await this.prisma.userTestResult.update({
      where: { id: userTestResultId },
      data: {
        totalCorrect: numberOfCorrectAnswers,
        totalIncorrect: numberOfSelectedOptions - numberOfCorrectAnswers,
        completionTimeSeconds,
        score: score,
      },
    });
    return updatedTestResult;
  }

  async submitWritingPart(userTestResultId: number, submitAnswersDto: SubmitAnswersDto) {
    const { testId, completionTimeSeconds, readingAnswers, listeningAnswers, writingAnswers } = submitAnswersDto;
    const answerData = await this.createWritingAnswers(
      userTestResultId,
      submitAnswersDto,
    );
    await this.updateWritingTestResult(
      userTestResultId,
      answerData,
      completionTimeSeconds,
    );

    return {
      submissionId: userTestResultId,
      status: 'submitted',
      submittedAt: new Date(),
    };
  }
  async getWritingTestResult(writingTestId: number) {
    const writingTestResult = await this.prisma.userTestResult.findFirst({
      where: { writingTestId },
    })
    return writingTestResult
  }

  private findAnswerText(questionId: number, answers: any) {
    const answer = answers.find(
      (answer: any) => answer.questionId === questionId,
    );
    return answer?.answerText || null;
  }
  async findWritingQuestionsOfTest(testId: number) {
    try {
      // Get all writing questions for the test
      const writingQuestions = await this.getWritingQuestions(testId);

      // Use Promise.all to handle async operations in parallel
      const questionList = await Promise.all(
        writingQuestions.map(async (writingQuestion) => {
          const questions = await this.getWritingQuestionsOfSubpart(
            writingQuestion.id,
          );

          // Calculate points for each question
          return questions.map((question) => ({
            ...question,
            point: writingQuestion.point / questions.length,
          }));
        }),
      );
      // Flatten the array of arrays into a single array
      return questionList.flat();
    } catch (error) {
      throw new Error(`Failed to fetch writing questions: ${error.message}`);
    }
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
  // Helper function to check if writing part is unique
  private async checkUniqueWritingPart(testId: number) {
    const writingTest = await this.prisma.writingTest.findFirst({
      where: { testId: testId },
    });
    if (writingTest) {
      throw new BadRequestException('Writing part already exists in the test');
    }
  }
  // Helper function to find writing test
  private async findWritingTest(subpartId: number) {
    const writingTest = await this.prisma.writingTest.findFirst({
      where: { id: subpartId },
    });
    if (!writingTest) {
      throw new NotFoundException('Writing subpart not found');
    }
    return writingTest;
  }
  // Helper function to check if writing subpart exists
  private async validateWritingSubpart(subpartId: number) {
    const writingSubpart = await this.prisma.writingSubpart.findFirst({
      where: { id: subpartId },
    });
    if (!writingSubpart) {
      throw new NotFoundException('Writing subpart not found');
    }
    return writingSubpart;
  }
  // Helper function to find writing subparts
  private async findWritingSubparts(writingTestId: number) {
    const writingSubparts = await this.prisma.writingSubpart.findMany({
      where: { writingTestId: writingTestId },
    });
    if (!writingSubparts) {
      throw new NotFoundException('Writing subparts not found');
    }
    return writingSubparts;
  }
  // Helper function to find writing questions of a writing subpart
  private async findWritingQuestions(writingSubpartId: number) {
    const writingQuestions = await this.prisma.writingQuestion.findMany({
      where: { writingSubpartId: writingSubpartId },
    });
    if (!writingQuestions) {
      throw new NotFoundException('Writing questions not found');
    }
    return writingQuestions;
  }
}
