import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  VisualizationResponseDto,
  NodeDto,
  UpdateVisualizationDto,
  UpdateVisualizationResponseDto,
} from './dto/visualizations.dto';

// 1. 내부 인터페이스 정의
interface StructuralGroup {
  group_name: string;
  group_type: 'layer' | 'feature' | 'package' | 'naming_convention' | 'domain';
  pattern: string;
  description: string;
}

interface Step2Data {
  structural_groups?: StructuralGroup[];
}

interface AnalysisQueryResult {
  step2: Step2Data | null;
}

// 2. 더미 데이터
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

// Node 엔티티 타입 (Prisma에서 생성된 타입 대신 사용)
interface NodeEntity {
  id: bigint;
  label: string;
  groups: string;
  x: number;
  y: number;
  contents: string;
}

@Injectable()
export class VisualizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisualization(
    analysisId: string,
  ): Promise<VisualizationResponseDto> {
    // 1. 이미 존재하는 시각화 정보가 있는지 확인 (중복 생성 방지)
    const existingVis = await this.prisma.visualization.findFirst({
      where: { analysisResultId: analysisId },
      include: { nodes: true },
    });

    if (existingVis) {
      return this.mapToResponseDto(existingVis.id, existingVis.nodes);
    }

    // 2. 존재하지 않을 경우에만 신규 생성 (트랜잭션 사용)
    return await this.prisma.$transaction(async (tx) => {
      const structuralGroups = await this.getStructuralGroups(analysisId);
      const nodesToCreate =
        this.parseStructuralGroupsForInsert(structuralGroups);

      const visualization = await tx.visualization.create({
        data: {
          analysisResultId: analysisId,
          formattedData: nodesToCreate as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.node.createMany({
        data: nodesToCreate.map((node) => ({
          visualizationId: visualization.id,
          x: 0,
          y: 0,
          label: node.label,
          contents: node.contents,
          groups: node.group,
        })),
      });

      const nodes = await tx.node.findMany({
        where: { visualizationId: visualization.id },
      });

      return this.mapToResponseDto(visualization.id, nodes);
    });
  }

  private mapToResponseDto(
    visualizationId: string,
    nodes: NodeEntity[],
  ): VisualizationResponseDto {
    return {
      visualizationId,
      nodes: nodes.map((node) => ({
        id: node.id.toString(),
        label: node.label,
        group: node.groups,
        x: node.x === 0 ? 'default' : node.x,
        y: node.y === 0 ? 'default' : node.y,
        contents: node.contents,
      })),
      edges: [],
    };
  }

  async resetVisualization(
    visualizationId: string,
  ): Promise<VisualizationResponseDto> {
    const visualization = await this.prisma.visualization.findUnique({
      where: { id: visualizationId },
    });

    if (!visualization) {
      throw new NotFoundException('Visualization not found');
    }

    // JSON 데이터를 NodeDto 배열로 안전하게 캐스팅
    const nodes = Array.isArray(visualization.formattedData)
      ? (visualization.formattedData as unknown as NodeDto[])
      : [];

    return {
      visualizationId,
      nodes,
      edges: [],
    };
  }

  async updateVisualization(
    visualizationId: string,
    updateDto: UpdateVisualizationDto,
  ): Promise<UpdateVisualizationResponseDto> {
    const visualization = await this.prisma.visualization.findUnique({
      where: { id: visualizationId },
    });

    if (!visualization) {
      throw new NotFoundException('Visualization not found');
    }

    const { formattedData } = updateDto;

    // 트랜잭션으로 노드들과 visualization을 함께 업데이트
    await this.prisma.$transaction(async (tx) => {
      // 각 노드의 x, y 값 업데이트
      await Promise.all(
        formattedData.map((nodeData) =>
          tx.node.update({
            where: { id: parseInt(nodeData.id, 10) },
            data: {
              x: nodeData.x === 'default' ? 0 : Number(nodeData.x),
              y: nodeData.y === 'default' ? 0 : Number(nodeData.y),
            },
          }),
        ),
      );

      // visualization의 formattedData 업데이트 (첫 PUT에서 원본 저장)
      await tx.visualization.update({
        where: { id: visualizationId },
        data: {
          formattedData: formattedData as unknown as Prisma.InputJsonValue,
        },
      });
    });

    return {
      visualizationId,
      success: true,
    };
  }

  private async getStructuralGroups(
    analysisId: string,
  ): Promise<StructuralGroup[]> {
    try {
      // Parameterized Query 사용 (CAST로 UUID 타입 변환)
      const results = await this.prisma.$queryRaw<AnalysisQueryResult[]>`
        SELECT step2 FROM analysis_results WHERE id = CAST(${analysisId} AS uuid)
      `;

      if (results.length > 0 && results[0].step2?.structural_groups) {
        return results[0].step2.structural_groups;
      }
    } catch (error) {
      console.error(`${analysisId}로 조회 실패 - 더미 데이터 사용`, error);
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
