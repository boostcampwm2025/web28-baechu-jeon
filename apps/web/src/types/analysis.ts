export interface AnalysisResult {
  success: boolean;
  data: AnalysisData;
}

export interface ProjectInfo {
  name: string;
  detectedFramework: string[];
  fileCount: number;
  folderCount: number;
}

export interface Architecture {
  [key: string]: any;
}

export interface Layer {
  name: string;
  path: string;
}

export interface Visualization {
  [key: string]: any;
}

export interface AnalysisData {
  projectInfo: ProjectInfo;
  boundaries: Record<string, BoundaryAnalysis>;
  architecture?: Architecture; // Legacy support or optional overall
  layers?: Layer[]; // Legacy support
  visualization?: Visualization;
  fileTree: FileTreeNode[];
  prompt?: string;
  rawAiResponse?: any;
}

export interface BoundaryAnalysis {
  architecturePatterns: ArchitecturePattern[];
  layers: BoundaryLayer[];
  dependencyFlow: string;
  assumptions: string[];
}

export interface ArchitecturePattern {
  name: string;
  evidence: string[];
}

export interface BoundaryLayer {
  name: string;
  responsibility: string;
  folders: string[];
  files: string[];
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
