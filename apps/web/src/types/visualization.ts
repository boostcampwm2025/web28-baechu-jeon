// NodeData 인터페이스 정의 및 export
export interface NodeData {
  id: string;
  label: string;
  groups: string;
  contents: string;
  type?: string;
  diagramType?: "STEP1" | "STEP2" | "STEP3";
}

export interface ProjectDetailsData {
  overview: string;
  purpose: string;
  keyFeatures: string[];
  technologyStack: Record<string, string[]>;
  architecturalTendencies: string;
}
