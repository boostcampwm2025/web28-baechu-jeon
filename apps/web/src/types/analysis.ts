export interface AnalysisResult {
  success: boolean;
  data: AnalysisData;
}

export interface AnalysisData {
  projectInfo: ProjectInfo;
  architecture: Architecture;
  layers: Layer[];
  visualization: Visualization;
  fileTree: FileTreeNode[];
  prompt?: string; // AI에게 보낸 프롬프트
  rawAiResponse?: any; // 원본 AI 응답 (파싱 실패 시)
}

export interface ProjectInfo {
  name: string;
  detectedFramework: string[];
  fileCount: number;
  folderCount: number;
}

export interface Architecture {
  type: string;
  patterns: string[];
  description: string;
}

export interface Layer {
  name: string;
  paths: string[];
  description: string;
  technicalDetails: string;
}

export interface Visualization {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
}

export interface VisualizationNode {
  id: string;
  label: string;
  type: 'frontend' | 'backend' | 'shared' | 'config';
  layer: string;
}

export interface VisualizationEdge {
  from: string;
  to: string;
  relationship: string;
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileTreeNode[];
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
