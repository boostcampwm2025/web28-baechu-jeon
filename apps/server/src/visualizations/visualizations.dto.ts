import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// 시각화 노드 DTO (도메인 중심)
export class NodeDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  group: string;

  x: number | 'default';

  y: number | 'default';

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

// 시각화 엣지 DTO
export class EdgeDto {
  @IsString()
  id: string;

  @IsString()
  source: string;

  @IsString()
  target: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class VisualizationResponseDto {
  @IsUUID()
  visualizationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes: NodeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EdgeDto)
  edges?: EdgeDto[];
}
