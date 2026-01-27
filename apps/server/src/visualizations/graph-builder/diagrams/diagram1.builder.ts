import {
  EdgeInput,
  NodeInput,
  Step3Analysis,
} from '../types/graph-builder.type';

export const buildDiagram1 = (step3AnalysisResult: Step3Analysis) => {
  const nodes: NodeInput[] = [];
  const edges: EdgeInput[] = [];

  const stories = step3AnalysisResult.user_stories;
  stories.forEach((story) => {
    nodes.push({
      label: story.story,
    });
  });

  return { nodes, edges };
};
