import {
  EdgeInput,
  NodeInput,
  Step3Analysis,
} from '../types/graph-builder.type';

export function buildDiagram3(step3AnalysisResult: Step3Analysis) {
  const edges: EdgeInput[] = [];

  const tech_stack = step3AnalysisResult.project_intent.technology_stack;

  const categoryMap = [
    { key: 'frontend', group: 'FE' },
    { key: 'backend', group: 'BE' },
    { key: 'infrastructure', group: 'INFRA' },
    { key: 'database', group: 'DB' },
    { key: 'extra', group: 'EXTRA' },
  ] as const;

  const nodes: NodeInput[] = categoryMap.flatMap(({ key, group }) =>
    tech_stack[key].map((tech) => ({
      label: tech,
      groups: group,
    })),
  );

  return { nodes, edges };
}
