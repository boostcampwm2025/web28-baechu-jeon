import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NodeDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsString()
  diagramType: string;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsString()
  contents?: string;
}

export class InitialNodesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  diagram1: NodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  diagram2: NodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  diagram3: NodeDto[];
}

export class EdgeDto {
  @IsString()
  id: string;

  @IsString()
  source: string;

  @IsString()
  target: string;

  @IsString()
  diagramType: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class VisualizationResponseDto {
  @IsUUID() visualizationId: string;
  @IsEnum(['INITIAL', 'LAYOUTED']) layoutState: 'INITIAL' | 'LAYOUTED';

  nodes: Record<string, NodeDto[]>;
  edges: Record<string, EdgeDto[]>;
}

export class UpdateVisualizationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes: NodeDto[];

  @IsOptional()
  edges: Record<string, EdgeDto[]>;
}

export class UpdateVisualizationResponseDto {
  @IsUUID()
  visualizationId: string;

  success: boolean;
}
