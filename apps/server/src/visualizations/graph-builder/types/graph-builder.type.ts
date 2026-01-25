import { Edge, Node } from '@prisma/client';

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

// types/graph-builder.type.ts
export type NodeInput = Omit<Node, 'id' | 'visualizationId' | 'groups'>;
export type EdgeInput = Omit<Edge, 'id' | 'visualizationId' | 'label' | 'type'>;
