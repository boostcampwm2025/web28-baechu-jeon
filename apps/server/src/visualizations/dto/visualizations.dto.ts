import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NodeDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  group: string;

  @ValidateIf((o: NodeDto) => o.x !== 'default')
  @IsNumber()
  @IsOptional()
  x: number | 'default';

  @ValidateIf((o: NodeDto) => o.x !== 'default')
  @IsNumber()
  @IsOptional()
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

export class UpdateVisualizationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  formattedData: NodeDto[];
}

export class UpdateVisualizationResponseDto {
  @IsUUID()
  visualizationId: string;

  success: boolean;
}
