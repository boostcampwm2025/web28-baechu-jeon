import { Injectable } from '@nestjs/common';
import { AnalysisResult } from '@prisma/client';
import { buildStep1 } from './steps/step1.builder';
import { Step1Json } from './types/graph-builder.type';

@Injectable()
export class GraphBuilderService {
  build(analysisResult: AnalysisResult) {
    const nodes = [];
    const edges = [];

    // analysisResult.step1가 null일 수가 있나..? 예외 처리를 해줘야하나?
    // 이중 타입 단언 저거 뭔가 잘못됐는데 일단 넘어가자. 타입 가드는 복잡함.
    const step1 = buildStep1(analysisResult.step1 as unknown as Step1Json);
    // const step2 = buildStep2(analysisResult.step2);

    // nodes.push(...step1.nodes, ...step2.nodes);
    // edges.push(...step1.edges, ...step2.edges);

    return { nodes, edges };
  }
}
