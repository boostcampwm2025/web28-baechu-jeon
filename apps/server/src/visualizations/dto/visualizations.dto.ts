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

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class VisualizationResponseDto {
  @IsUUID()
  visualizationId: string;

  @IsEnum(['INITIAL', 'LAYOUTED'])
  layoutState: 'INITIAL' | 'LAYOUTED';

  @ValidateNested()
  @Type((opts) => {
    // 런타임에 layoutState에 따라 변환 클래스 결정
    return opts?.object?.layoutState === 'INITIAL' ? InitialNodesDto : NodeDto;
  })
  nodes: InitialNodesDto | NodeDto[] = [];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EdgeDto)
  edges: EdgeDto[] = [];
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
