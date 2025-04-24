import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ScoringService {
  private readonly GEMINI_API_KEY =
    process.env.GEMINI_API_KEY || 'AIzaSyDNxisG9F_mJcL5HX2I1Kjh0K0tAoDS5RQ';

  private buildPrompt(essay: string, question: string): string {
    return `
Bạn là một giám khảo tiếng Việt. Hãy chấm điểm bài viết sau theo 5 tiêu chí:
1. Tổ chức (0-20)
2. Phát triển nội dung (0-20)
3. Ngữ pháp (0-20)
4. Dấu câu và chính tả (0-20)
5. Phong cách và chất lượng bài viết (0-20)

Hãy trả về kết quả dưới dạng JSON như sau:
{
  "score": <tổng điểm>
}
Hãy chỉ trả về **JSON thuần túy**, không thêm lời giải thích, tiêu đề, hay bất kỳ chữ nào khác.

Câu hỏi:
---
${question}
---

Bài viết:
---
${essay}
---
    `.trim();
  }

  async gradeEssay(essay: string, question: string): Promise<any> {
    const prompt = this.buildPrompt(essay, question);
  
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.GEMINI_API_KEY}`, {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  
    const textResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
  
    let rawScore;
    try {
      rawScore = JSON.parse(textResponse);
    } catch (e) {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          rawScore = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Không thể phân tích đoạn JSON trích xuất từ phản hồi.');
        }
      } else {
        throw new Error('Không thể phân tích phản hồi từ Gemini');
      }
    }
  
    // Chuyển đổi từ thang 100 về thang 6
    const originalScore = rawScore.score;
    const scaledScore = Math.round((originalScore / 100) * 6);
  
    return { score: scaledScore };
  }
}
