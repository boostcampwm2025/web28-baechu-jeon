import {
  EdgeInput,
  NodeInput,
  Step3Analysis,
} from '../types/graph-builder.type';
import { normalize } from '../utils/graph-builder.util';

export const buildDiagram1 = (
  step3AnalysisResult: Step3Analysis,
  maxDepth: number,
) => {
  const nodes: NodeInput[] = [];
  const edges: EdgeInput[] = [];

  const stories = step3AnalysisResult?.user_stories ?? [];
  stories.forEach((story) => {
    const relatedPaths = new Set(
      story.related_paths?.map((path) => normalize(path, maxDepth)) ?? [],
    );

    nodes.push({
      label: story.story,
      relatedPaths: Array.from(relatedPaths),
    });
  });

  return { nodes, edges };
};
