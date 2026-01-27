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
    // 파일 경로는 디렉토리 경로로 변환
    const relatedFolders = story.related_folders.map((path) => {
      // 경로의 마지막 부분이 파일인지 확인 (확장자가 있는지)
      const parts = path.split('/');
      const lastPart = parts[parts.length - 1];

      // 마지막 부분에 확장자가 있으면 파일이므로 제거
      if (lastPart.includes('.')) {
        return parts.slice(0, -1).join('/');
      }

      return path;
    });

    nodes.push({
      label: story.story,
      // TODO: 고민해보기 max-depth로 잘린 폴더가 있다면?
      // TODO: 근데 지금 max-depth가 의미가 있나?
      relatedFolders,
    });
  });

  return { nodes, edges };
};
