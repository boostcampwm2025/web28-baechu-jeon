import { Injectable } from '@nestjs/common';
import { Observable, interval, map, take } from 'rxjs';
import { GeminiProvider } from '../aiModel/providers/gemini/gemini.provider';
import { AnalysisResultRepository } from './repositories/analysis-result.repository';
import { AIAnalysisRequest } from '../aiModel/types/ai-request.types';

export enum AnalysisStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AnalysisStep {
  PREPROCESSING = 'preprocessing',
  DEPENDENCY_ANALYSIS = 'dependency_analysis',
  AI_ANALYSIS = 'ai_analysis',
  RESULT_GENERATION = 'result_generation',
}

@Injectable()
export class AnalysisService {
  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly analysisResultRepository: AnalysisResultRepository,
  ) {}

  private readonly analysisSteps = [
    AnalysisStep.PREPROCESSING,
    AnalysisStep.DEPENDENCY_ANALYSIS,
    AnalysisStep.AI_ANALYSIS,
    AnalysisStep.RESULT_GENERATION,
  ];

  async startAiAnalysis(projectId: string): Promise<void> {
    try {
      console.log(`[AnalysisService] Starting AI analysis for project ${projectId}`);
      const aiRequest: AIAnalysisRequest = {
        projectId: projectId,
        model: 'gemini',
        data: {},
      };
      const aiResponse = await this.geminiProvider.analyze(aiRequest);

      // AI 응답에서 'text' 필드 추출 시도
      let rawText: string | null = null;
      if (
        aiResponse.result &&
        Array.isArray((aiResponse.result as any).candidates) &&
        (aiResponse.result as any).candidates.length > 0 &&
        (aiResponse.result as any).candidates[0].content &&
        Array.isArray((aiResponse.result as any).candidates[0].content.parts) &&
        (aiResponse.result as any).candidates[0].content.parts.length > 0 &&
        typeof (aiResponse.result as any).candidates[0].content.parts[0].text ===
          'string'
      ) {
        rawText = (aiResponse.result as any).candidates[0].content.parts[0].text;
      }

      let aiResultToSave: unknown;

      if (rawText) {
        try {
          // 텍스트에서 JSON 블록(객체 또는 배열)을 찾아서 파싱
          const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```|({[\s\S]*}|\[[\s\S]*\])/);
          const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : rawText;
          aiResultToSave = JSON.parse(jsonString);
        } catch (e) {
          console.warn(
            `[AnalysisService] Failed to parse JSON from AI response text. Saving raw text for project ${projectId}.`,
          );
          aiResultToSave = rawText; // 파싱 실패 시 원본 텍스트 저장
        }
      } else {
        console.warn(
          `[AnalysisService] 'text' field not found in AI response. Saving full response for project ${projectId}.`,
        );
        aiResultToSave = aiResponse.result; // 'text' 필드가 없으면 전체 응답 저장
      }

      await this.analysisResultRepository.createOrUpdate(
        projectId,
        aiResultToSave,
      );
      console.log(
        `[AnalysisService] AI analysis completed and saved for project ${projectId}`,
      );
    } catch (error) {
      console.error(
        `[AnalysisService] AI analysis failed for project ${projectId}:`, error,
      );
      // Optionally, update analysis result with a failure status
    }
  }

  /**
   * 분석 상태 스트림 생성 (Mock 데이터 -> 실제 데이터로 변경 필요)
   * @param projectId 프로젝트 ID
   * @returns 분석 상태 Observable
   */
  getStatusStream(projectId: string): Observable<{
    status: AnalysisStatus;
    currentStep: AnalysisStep | null;
    projectId: string;
  }> {
    let stepIndex = 0;

    return interval(2000).pipe(
      take(this.analysisSteps.length + 1), // 모든 단계 + 완료 상태까지 emit 후 종료
      map(() => {
        // TODO: 실제 AI 분석 상태를 여기서 확인해야 합니다.
        // 지금은 mock이므로 AI_ANALYSIS 단계에서 실제 분석 완료 여부를 확인해야 합니다.

        if (stepIndex >= this.analysisSteps.length) {
          return {
            status: AnalysisStatus.COMPLETED,
            currentStep: null,
            projectId,
          };
        }

        const currentStep = this.analysisSteps[stepIndex];
        stepIndex++;

        return {
          status: AnalysisStatus.PROCESSING,
          currentStep,
          projectId,
        };
      }),
    );
  }
}
