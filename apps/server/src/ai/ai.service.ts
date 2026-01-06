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
    summary: string;
    structure: string;
    technologies: string[];
    dependencies: string[];
    architecture: string;
  } {
    // Mock 데이터 반환
    return {
      projectId,
      summary:
        '이 프로젝트는 Next.js와 NestJS를 사용한 모노레포 구조의 웹 애플리케이션입니다. 프론트엔드는 Next.js의 App Router를 사용하며, 백엔드는 NestJS로 RESTful API를 제공합니다.',
      structure:
        '프로젝트는 Turborepo를 사용한 모노레포 구조로 되어 있습니다. apps/web은 Next.js 프론트엔드, apps/server는 NestJS 백엔드를 담당합니다. 각 앱은 독립적으로 빌드되고 배포될 수 있습니다.',
      technologies: [
        'Next.js',
        'NestJS',
        'TypeScript',
        'Tailwind CSS',
        'Turborepo',
      ],
      dependencies: ['react', 'next', '@nestjs/common', '@nestjs/core', 'rxjs'],
      architecture:
        '프론트엔드는 Server-Side Rendering(SSR)과 Client-Side Rendering(CSR)을 모두 지원합니다. 백엔드는 모듈 기반 아키텍처를 사용하여 관심사를 분리하고 있습니다.',
    };
  }
}
