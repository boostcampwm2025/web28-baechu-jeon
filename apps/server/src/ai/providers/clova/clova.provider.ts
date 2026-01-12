import { Injectable } from '@nestjs/common';
import { ClovaService } from './clova.service';
import { AIProvider } from '../../interfaces/ai-provider.interface';
import { AIAnalysisRequest } from '../../types/ai-request.types';
import { AIAnalysisResponse } from '../../types/ai-response.types';

/**
 * Clova AI Provider 구현체
 */
@Injectable()
export class ClovaProvider implements AIProvider {
  constructor(private readonly clovaService: ClovaService) {}

  /**
   * 프로젝트 분석 요청
   * @param request 분석 요청 데이터
   * @returns 분석 결과
   */
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // 시스템 프롬프트와 유저 프롬프트
    const { systemPrompt, userPrompt } = this.buildPrompts(request);

    // Clova API 호출
    const apiResponse = await this.clovaService.callAPI(
      systemPrompt,
      userPrompt,
    );

    // 응답 그대로 반환
    return {
      projectId: request.projectId,
      result: apiResponse as Record<string, unknown>,
    };
  }

  /**
   * 요청 데이터를 시스템/유저 프롬프트로 변환
   * @param request 분석 요청 데이터
   * @returns 시스템 프롬프트와 유저 프롬프트
   */
  private buildPrompts(request: AIAnalysisRequest): {
    systemPrompt: string;
    userPrompt: string;
  } {
    const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.`;

    const userPrompt = `프로젝트 ID: ${request.projectId}
프로젝트 데이터: ${JSON.stringify(request.data, null, 2)}`;

    return { systemPrompt, userPrompt };
  }
}
