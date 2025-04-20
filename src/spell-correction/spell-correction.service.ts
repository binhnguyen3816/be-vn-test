// spell-correction.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import axios from 'axios';

@Injectable()
export class SpellCorrectionService {
    // private openai: OpenAI;

    // constructor(private configService: ConfigService) {
    //   this.openai = new OpenAI({
    //     apiKey: process.env.OPENAI_API_KEY || this.configService.get('OPENAI_API_KEY'),
    //   });
    // }

    // async correctText(text: string): Promise<string> {
    //   const prompt = `Hãy sửa lỗi chính tả trong đoạn văn sau bằng tiếng Việt, giữ nguyên ý nghĩa và không dịch sang ngôn ngữ khác:\n\n"${text}"`;

    //   const completion = await this.openai.chat.completions.create({
    //     model: 'gpt-4o',
    //     messages: [{ role: 'user', content: prompt }],
    //     temperature: 0.2,
    //   });

    //   return completion.choices[0].message.content.trim();
    // }
  private readonly apiKey: string;
  private readonly geminiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
  }

  async correctText(inputText: string): Promise<string> {
    const prompt = `Sửa lỗi chính tả trong đoạn văn sau bằng tiếng Việt. Giữ nguyên ý nghĩa và cấu trúc câu, chỉ trả về đoạn văn đã được sửa lỗi mà không thêm từ hoặc bớt gì khác:\n\n"${inputText}"`;

    const response = await axios.post(
      `${this.geminiUrl}?key=${this.apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const output = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return output || 'Không thể sửa lỗi';
  }
}
