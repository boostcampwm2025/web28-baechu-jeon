import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * AI 분석 결과 조회 (Mock 데이터)
   * @param projectId 프로젝트 ID
   * @returns AI 분석 결과
   */
  getAnalysisResult(projectId: string): {
    projectId: string;
    overview: {
      projectType: string;
      framework: string[];
      language: string[];
      projectSize: string;
    };
    architecture: {
      pattern: string;
      layers: string[];
      description: string;
    };
    components: {
      name: string;
      responsibility: string;
      location: string;
    }[];
    techStack: {
      frameworks: string[];
      libraries: string[];
      tools: string[];
    };
  } {
    // Mock 데이터 반환
    return {
      projectId,
      overview: {
        projectType: '웹 애플리케이션',
        framework: ['Next.js', 'NestJS'],
        language: ['TypeScript'],
        projectSize: '중형',
      },
      architecture: {
        pattern: 'Layered Architecture',
        layers: ['Presentation', 'Service', 'Data Access'],
        description:
          '프로젝트는 3계층 아키텍처를 따르고 있습니다. 프론트엔드는 Next.js의 App Router를 사용하여 Presentation 계층을 담당하고, 백엔드는 NestJS의 모듈 기반 구조로 Service와 Data Access 계층을 분리하고 있습니다.',
      },
      components: [
        {
          name: 'Analysis',
          responsibility:
            '프로젝트 구조 분석 및 AI 분석 결과 제공을 담당합니다.',
          location: 'apps/server/src/ai',
        },
        {
          name: 'Web Frontend',
          responsibility: '사용자 인터페이스와 분석 결과 시각화를 담당합니다.',
          location: 'apps/web/src',
        },
        {
          name: 'Shared UI',
          responsibility: '공통 UI 컴포넌트를 제공합니다.',
          location: 'packages/ui',
        },
      ],
      techStack: {
        frameworks: ['Next.js', 'NestJS', 'React'],
        libraries: ['TypeScript', 'Tailwind CSS', 'RxJS'],
        tools: ['Turborepo', 'ESLint', 'Prettier'],
      },
    };
  }
}
