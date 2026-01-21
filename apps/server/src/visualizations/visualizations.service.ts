import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisualizationResponseDto, NodeDto } from './visualizations.dto';

// 분석 결과에서 받는 structural_groups 타입
interface StructuralGroup {
  group_name: string;
  group_type: 'layer' | 'feature' | 'package' | 'naming_convention' | 'domain';
  pattern: string;
  description: string;
}

// 더미 데이터
const DEMO_STRUCTURAL_GROUPS: StructuralGroup[] = [
  {
    group_name: 'backend_api_modules',
    group_type: 'layer',
    pattern: 'apps/server/src/**/*.controller.ts',
    description: 'NestJS API 컨트롤러 모듈들을 포함하는 백엔드 API 레이어',
  },
  {
    group_name: 'backend_data_access',
    group_type: 'layer',
    pattern: 'apps/server/src/**/*.service.ts, apps/server/prisma/*',
    description: '데이터베이스 접근 및 비즈니스 로직을 담당하는 레이어',
  },
  {
    group_name: 'frontend_components',
    group_type: 'feature',
    pattern: 'apps/web/src/components/**/*.tsx',
    description: 'React 컴포넌트들을 포함하는 프론트엔드 UI 레이어',
  },
  {
    group_name: 'frontend_api_client',
    group_type: 'feature',
    pattern: 'apps/web/src/api/**/*.ts',
    description: '백엔드 API와 통신하는 클라이언트 레이어',
  },
  {
    group_name: 'shared_packages',
    group_type: 'package',
    pattern: 'packages/*',
    description: '프론트엔드와 백엔드에서 공유하는 패키지들',
  },
];

@Injectable()
export class VisualizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisualization(
    analysisId: string,
  ): Promise<VisualizationResponseDto> {
    // 1. analysis_results에서 step2 가져오기
    const structuralGroups = await this.getStructuralGroups(analysisId);

    // 2. structural_groups를 파싱해서 노드 데이터 생성
    const nodesToCreate = this.parseStructuralGroupsForInsert(structuralGroups);

    // 3. Visualization 생성 (formattedData에 원본 노드 데이터 저장)
    const visualization = await this.prisma.visualization.create({
      data: {
        analysisResultId: analysisId,
        formattedData: nodesToCreate,
      },
    });

    // 4. nodes 테이블에 insert
    await this.prisma.node.createMany({
      data: nodesToCreate.map((node) => ({
        visualizationId: visualization.id,
        x: 0,
        y: 0,
        label: node.label,
        contents: node.contents,
        groups: node.group,
      })),
    });

    // 5. DB에서 insert된 노드들 조회
    const nodes = await this.prisma.node.findMany({
      where: { visualizationId: visualization.id },
    });

    // 6. 클라이언트 응답 형식으로 변환 (x, y가 0이면 'default')
    const nodesDtos: NodeDto[] = nodes.map((node) => ({
      id: node.id.toString(),
      label: node.label,
      group: node.groups,
      x: node.x === 0 ? 'default' : node.x,
      y: node.y === 0 ? 'default' : node.y,
      contents: node.contents,
    }));

    return {
      visualizationId: visualization.id,
      nodes: nodesDtos,
      edges: [],
    };
  }

  async resetVisualization(
    visualizationId: string,
  ): Promise<VisualizationResponseDto> {
    // visualization에서 formattedData(원본 데이터) 조회
    const visualization = await this.prisma.visualization.findUnique({
      where: { id: visualizationId },
    });

    if (!visualization) {
      throw new Error('Visualization not found');
    }

    return {
      visualizationId,
      nodes: visualization.formattedData as unknown as NodeDto[],
      edges: [],
    };
  }

  private async getStructuralGroups(
    analysisId: string,
  ): Promise<StructuralGroup[]> {
    try {
      const results = await this.prisma.$queryRaw<{ step2: unknown }[]>`
        SELECT step2 FROM analysis_results WHERE id = ${analysisId}::uuid
      `;

      if (results.length > 0 && results[0].step2) {
        const step2Data = results[0].step2 as {
          structural_groups?: StructuralGroup[];
        };
        if (step2Data.structural_groups) {
          return step2Data.structural_groups;
        }
      }
    } catch {
      // DB 조회 실패 시 더미 데이터 사용
      console.log(
        `${analysisId}로 조회 실패- STRUCTURAL_GROUPS 더미 데이터 사용`,
      );
    }

    return DEMO_STRUCTURAL_GROUPS;
  }

  private parseStructuralGroupsForInsert(
    structuralGroups: StructuralGroup[],
  ): { label: string; contents: string; group: string }[] {
    const nodes: { label: string; contents: string; group: string }[] = [];

    structuralGroups.forEach((sg) => {
      const folders = this.extractFoldersFromPattern(sg.pattern);
      folders.forEach((folder) => {
        nodes.push({
          label: folder.name,
          contents: sg.description,
          group: sg.group_name,
        });
      });
    });

    return nodes;
  }

  private extractFoldersFromPattern(
    pattern: string,
  ): { name: string; path: string }[] {
    const patterns = pattern.split(',').map((p) => p.trim());
    const folders: { name: string; path: string }[] = [];

    patterns.forEach((p) => {
      const cleanPath = p
        .replace(/\*\*\/?\*?\.[a-z]+$/i, '')
        .replace(/\/\*$/, '')
        .replace(/\*$/, '');

      if (cleanPath) {
        const parts = cleanPath.split('/').filter(Boolean);
        const name = parts[parts.length - 1] || parts[parts.length - 2] || p;
        folders.push({ name, path: cleanPath });
      }
    });

    return folders.slice(0, 3);
  }
}
