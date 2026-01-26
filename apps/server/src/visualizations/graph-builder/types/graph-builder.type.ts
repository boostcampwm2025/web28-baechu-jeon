export interface Step1Json {
  project_overview: {
    description: string;
    purpose: string;
  };
  project_features: Array<{
    feature_name: string;
    feature_description: string;
    feature_detailed_description: string;
    related_folders: string[];
    depends_on_features: string[];
  }>;
  technology_stack: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
  };
}

export interface Step2Json {
  responsibility_hypotheses: Array<{
    folder_path: string;
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
  contents: string;
};

export type NodeTemp = {
  path: string; // 임시 node id
  label: string;
  contents: string;
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
};
