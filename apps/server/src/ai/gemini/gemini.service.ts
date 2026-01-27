import { Injectable } from '@nestjs/common';
import { GeminiClient } from './gemini.client';
import { ProjectRepository } from 'src/projects/repository/project.repository';
import {
  AiProvider,
  AnalysisRequest,
  AnalysisResponse,
} from '../interface/ai.interface';
import { PromptResponse } from '../types/ai.types';
import { buildStep1Prompts } from '../prompts/step1.prompt';
import { buildStep2Prompts } from '../prompts/step2.prompt';
import { buildStep3Prompts } from '../prompts/step3.prompt';
import { parseAiJson } from '../utils/parse-ai-json.util';

// TODO: 단계별로 systemPrompt, userPrompt 넣기

@Injectable()
export class GeminiService implements AiProvider {
  constructor(
    private readonly geminiClient: GeminiClient,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async buildPrompt(input: AnalysisRequest): Promise<PromptResponse> {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) throw new Error('프로젝트를 찾을 수 없습니다.');

    // step에 따라 프롬프트를 선택
    switch (input.step) {
      case 1:
        return buildStep1Prompts(project);
      case 2:
        if (!input.analysisResult)
          throw new Error('분석 결과를 찾을 수 없습니다.');
        return buildStep2Prompts({
          project,
          analysisResult: input.analysisResult,
        });
      case 3:
        if (!input.analysisResult)
          throw new Error('분석 결과를 찾을 수 없습니다.');
        return buildStep3Prompts({
          project,
          analysisResult: input.analysisResult,
        });
      default:
        throw new Error('유효하지 않은 단계입니다.');
    }
  }

  async getResult(input: AnalysisRequest): Promise<AnalysisResponse> {
    const { systemPrompt, userPrompt } = await this.buildPrompt(input);
    const analysisResult = await this.geminiClient.generateResponse({
      userPrompt,
      systemPrompt,
    });

    const content = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('AI 응답을 생성하지 못했습니다.');
    const result = parseAiJson<AnalysisResponse>(content);
    return { result };
  }
}
