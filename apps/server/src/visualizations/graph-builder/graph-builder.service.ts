import { Injectable } from '@nestjs/common';
import { AnalysisResult } from '@prisma/client';
import { buildStep1 } from './steps/step1.builder';
import {
  EdgeInput,
  GraphBuildResult,
  NodeInput,
  Step1Json,
  Step2Json,
} from './types/graph-builder.type';
import { buildStep2 } from './steps/step2.builder';

@Injectable()
export class GraphBuilderService {
  build(analysisResult: AnalysisResult): GraphBuildResult {
    // const nodes: NodeInput[] = [];
    // const edges: EdgeInput[] = [];

    // analysisResult.step1가 null일 수가 있나..? 예외 처리를 해줘야하나?
    // 이중 타입 단언 저거 뭔가 잘못됐는데 일단 넘어가자. 타입 가드는 복잡함.
    const step1 = buildStep1(analysisResult.step1 as unknown as Step1Json);
    const step2 = buildStep2(analysisResult.step2 as unknown as Step2Json, 6);

    // step을 구분해야 해서 이렇게 섞는 건 안 될 듯
    // nodes.push(...step1.nodes, ...step2.nodes);
    // edges.push(...step1.edges, ...step2.edges);

    const result: GraphBuildResult = {
      step1: {
        nodes: step1.nodes,
        edges: step1.edges,
      },
      step2: {
        nodes: step2.nodes,
        edges: step2.edges,
      },
    };

    return result;
  }
}
