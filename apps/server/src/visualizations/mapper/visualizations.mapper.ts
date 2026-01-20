import { Injectable } from '@nestjs/common';
import {
  VisualizationModel,
  VisualizationNode,
  VisualizationEdge,
} from '../visualizations.builder';
import {
  VisualizationResponseDto,
  NodeDto,
  EdgeDto,
} from '../visualizations.dto';

// 내부 모델 → React Flow 친화 구조로 변환

@Injectable()
export class VisualizationsMapper {
  toResponseDto(model: VisualizationModel): VisualizationResponseDto {
    return {
      visualizationId: model.id,
      analysisId: model.analysisId,
      nodes: model.nodes.map((node) => this.toNodeDto(node)),
      edges: model.edges.map((edge) => this.toEdgeDto(edge)),
    };
  }

  private toNodeDto(node: VisualizationNode): NodeDto {
    return {
      id: node.id,
      type: node.type,
      position: this.calculatePosition(node),
      data: {
        label: node.label,
        ...node.metadata,
      },
    };
  }

  private toEdgeDto(edge: VisualizationEdge): EdgeDto {
    return {
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: edge.type,
      data: edge.metadata,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculatePosition(_node: VisualizationNode): { x: number; y: number } {
    // TODO: 실제 레이아웃 알고리즘 구현
    return { x: 0, y: 0 };
  }
}
