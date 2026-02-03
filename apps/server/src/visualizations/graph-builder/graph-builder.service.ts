import { Injectable } from '@nestjs/common';
import { AnalysisResult } from '@prisma/client';
import {
  GraphBuildResult,
  Step3Analysis,
  Step2Analysis,
} from './types/graph-builder.type';
import { buildDiagram1 } from './diagrams/diagram1.builder';
import { buildDiagram2 } from './diagrams/diagram2.builder';
import { buildDiagram3 } from './diagrams/diagram3.builder';

@Injectable()
export class GraphBuilderService {
  build(analysisResult: AnalysisResult): GraphBuildResult {
    // step2 = 가설(responsibility_hypotheses) + 의도(project_intent, user_stories) 통합
    const step2Data = analysisResult.step2 as unknown as Step2Analysis &
      Step3Analysis;
    const diagram1 = buildDiagram1(step2Data, 10);
    const diagram2 = buildDiagram2(step2Data as unknown as Step2Analysis, 10);
    const diagram3 = buildDiagram3(step2Data);

    const result: GraphBuildResult = {
      step1: {
        nodes: diagram1.nodes,
        edges: diagram1.edges,
      },
      step2: {
        nodes: diagram2.nodes,
        edges: diagram2.edges,
      },
      step3: {
        nodes: diagram3.nodes,
        edges: diagram3.edges,
      },
    };

    return result;
  }
}
