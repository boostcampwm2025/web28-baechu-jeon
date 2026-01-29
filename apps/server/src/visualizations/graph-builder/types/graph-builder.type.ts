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
  user_stories: [
    {
      story: string; // node
      related_folders: string[];
      rationale: string;
    },
  ];
}

export interface Step2Analysis {
  responsibility_hypotheses: Array<{
    path: string;
    hypothesis: string;
    evidence: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
}

// export type NodeInput = Omit<Node, 'id' | 'visualizationId' | 'groups'>;
// export type EdgeInput = Omit<Edge, 'id' | 'visualizationId' | 'label' | 'type'>;

export type EdgeInput = {
  sourcePath: string | number;
  targetPath: string | number;
};

export type NodeInput = {
  label: string;
  contents?: string;
  relatedNodeIds?: string[];
  relatedPaths?: string[];
  type?: 'FOLDER' | 'FILE';
  groups?: 'FE' | 'BE' | 'INFRA' | 'DB' | 'EXTRA';
};

export type NodeTemp = {
  path: string; // 임시 node id
  label: string;
  contents: string;
  relatedNodeIds?: string[];
  relatedPaths?: string[];
  type?: 'FOLDER' | 'FILE';
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
