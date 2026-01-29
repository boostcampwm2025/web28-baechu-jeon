export interface Step3Analysis {
  project_intent: {
    overview: string;
    purpose: string;
    architectural_tendencies: string;
    key_features: string[];
    technology_stack: {
      frontend: string[];
      backend: string[];
      infrastructure: string[];
      database: string[];
      extra: string[];
    };
    evidence: string[];
    confidence: 'low' | 'medium' | 'high';
  };
  user_stories: Array<{
    story: string;
    related_paths: string[];
    rationale: string;
  }>;
}

export interface Step2Analysis {
  responsibility_hypotheses: Array<{
    path: string;
    hypothesis: string;
    evidence: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
}

// types/graph-builder.type.ts
// export type NodeInput = Omit<Node, 'id' | 'visualizationId' | 'groups'>;
// export type EdgeInput = Omit<Edge, 'id' | 'visualizationId' | 'label' | 'type'>;

export type EdgeInput = {
  sourcePath: string | number;
  targetPath: string | number;
};

export type NodeInput = {
  label: string;
  contents?: string;
  groups?: 'FE' | 'BE' | 'INFRA' | 'DB' | 'EXTRA';
  relatedPaths?: string[];
};

export type NodeTemp = {
  path: string; // 임시 node id (폴더 또는 파일 경로)
  label: string;
  contents: string;
  relatedPaths?: string[];
};

export type GraphBuildResult = {
  step1: {
    nodes: NodeInput[];
    edges: EdgeInput[];
  };
  step2: {
    nodes: NodeTemp[];
    edges: EdgeInput[];
  };
  step3: {
    nodes: NodeInput[];
    edges: EdgeInput[];
  };
};
