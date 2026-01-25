import { EdgeInput, NodeInput, Step1Json } from '../types/graph-builder.type';

export const buildStep1 = (step1Json: Step1Json) => {
  // node label: feature_description
  // node contents: feature_detailed_description, related_folders
  // related_folders에서 path 경로를 어디까지 파싱해야 하지? 걍 냅둬도 되려나..
  // depends_on_features끼리 순서 매기려고 했는데 전혀 안 맞음. 그리고 기능 단위로 받으니까 병렬적임.. 그냥 프롬프트에 프로젝트 설명 쪼개달라고 해야할 듯.
  // 프로젝트 흐름이 아니라 SSE 같은 기능까지 가져와버림
  // 이런 주요 기능은 프로젝트 상세 설명에서 해주는 게 나을 것 같음

  const nodes: NodeInput[] = [];
  const edges: EdgeInput[] = [];

  const features = step1Json.project_features;

  features.forEach((feature) => {
    nodes.push({
      label: feature.feature_description,
      contents: `Feature_Detailed_Description: ${feature.feature_detailed_description}\nRelated Folders: ${feature.related_folders.join(', ')}`,
    });
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      sourcePath: i,
      targetPath: i + 1,
    });
  }

  return { nodes, edges };
};

// {
//   "project_overview": {
//     "description": "string",
//     "purpose": "string"
//   },
//   "project_features": [
//     {
//       "feature_name": "string",
//       "feature_description": "string",
//       "feature_detailed_description": "string",
//       "related_folders": ["string"],
//       "depends_on_features": ["string"]
//     }
//   ],
//   "technology_stack": {
//     "frontend": ["string"],
//     "backend": ["string"],
//     "database": ["string"],
//     "infrastructure": ["string"]
//   }
// }
