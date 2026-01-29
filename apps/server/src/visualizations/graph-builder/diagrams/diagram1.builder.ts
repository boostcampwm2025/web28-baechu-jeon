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
    // 폴더·파일 경로 그대로 사용 (중복 제거)
    const relatedPaths = [...new Set(story.related_paths)];

    nodes.push({
      label: story.story,
      relatedPaths,
    });
  });

  return { nodes, edges };
};
