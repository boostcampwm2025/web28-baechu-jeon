import { Injectable } from '@nestjs/common';
import { GeminiClient } from './gemini.client';
import { ProjectRepository } from 'src/projects/repository/project.repository';
import {
  AiProvider,
  AnalysisRequest,
  AnalysisResponse,
} from '../interface/ai.interface';
import { PromptResponse } from '../types/ai.types';

// TODO: 단계별로 systemPrompt, userPrompt 넣기

@Injectable()
export class GeminiService implements AiProvider {
  constructor(
    private readonly geminiClient: GeminiClient,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async buildPrompt(projectId: string): Promise<PromptResponse> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error('프로젝트를 찾을 수 없습니다.');

    const systemPrompt = '';
    const userPrompt = '';

    return { systemPrompt, userPrompt };
  }

  async getResult(input: AnalysisRequest): Promise<AnalysisResponse> {
    const { systemPrompt, userPrompt } = await this.buildPrompt(
      input.projectId,
    );
    const analysisResult = await this.geminiClient.generateResponse({
      userPrompt: input.userPrompt || userPrompt,
      systemPrompt: input.systemPrompt || systemPrompt,
    });

    const content = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('AI 응답을 생성하지 못했습니다.');

    return { content };
  }
}
