import { Controller, Get } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller()
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('test-gemini')
  async testGemini() {
    return this.geminiService.callGeminiAPI(
      '로켓 발사의 원리는 뭔가요?',
      '당신은 과학자입니다.',
    );
  }
}
