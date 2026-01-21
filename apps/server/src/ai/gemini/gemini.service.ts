import { Injectable } from '@nestjs/common';
import { GeminiClient } from './gemini.client';
import { ProjectRepository } from 'src/projects/repository/project.repository';

// TODO: 단계별로 systemPrompt, userPrompt 넣기

@Injectable()
export class GeminiService {
  constructor(
    private readonly geminiClient: GeminiClient,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async buildPrompt(
    projectId: string,
  ): Promise<{ systemPrompt: string; userPrompt: string }> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error('프로젝트를 찾을 수 없습니다.');

    const systemPrompt = '';
    const userPrompt = '';

    return { systemPrompt, userPrompt };
  }

  async getResult(input: {
    userPrompt: string;
    systemPrompt: string;
    projectId: string;
  }) {
    const { systemPrompt, userPrompt } = await this.buildPrompt(
      input.projectId,
    );
    const analysisResult = await this.geminiClient.generateResponse({
      userPrompt: input.userPrompt || userPrompt,
      systemPrompt: input.systemPrompt || systemPrompt,
    });
    return analysisResult;
  }
}
