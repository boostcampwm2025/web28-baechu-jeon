import { Step2Input } from '../types/ai.types';

// TODO: systemPrompt 다듬기

export const buildStep2Prompts = ({ analysisResult, project }: Step2Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다. 1단계에서 분석된 구조적 그룹 정보와 프로젝트의 메타데이터를 바탕으로 각 폴더의 역할을 추론합니다.

# 분석 지침

**역할 가설 생성 (Responsibility Hypothesis)**
- 각 폴더가 무슨 일을 할 가능성이 있는지 구조적 특징과 메타데이터 단서를 기반으로 가설 형태로 제공
- 반드시 근거를 명시해야 함
- 2단계에서 분석된 structural_groups 정보를 활용하여 각 그룹 내 폴더들의 역할을 추론
- 각 가설에 대해 신뢰도(confidence)를 0.0 ~ 1.0 사이의 값으로 평가해야 함


**중요 사항:**
- 설명은 한글로 하세요.
- 구조적 특징과 메타데이터(README, package.json 등)를 종합적으로 고려
- 각 가설은 명확한 근거를 가져야 함
- 신뢰도는 근거의 명확성과 확실성에 따라 정확하게 평가해야 함

**다음 JSON 형식으로 응답해주세요 (반드시 이 형식을 정확히 따르세요):**
{
 "responsibility_hypotheses": [
  {
    "folder_path": "폴더 경로",
    "hypothesis": "이 폴더가 무슨 일을 할 가능성이 있는지 가설",
    "evidence": "가설의 근거 (구조적 특징, 메타데이터 내용 등)",
    "confidence": 0.0 ~ 1.0 사이의 신뢰도 값 (0.0: 매우 낮음, 1.0: 매우 높음),
    "related_groups": ["관련된 structural_group의 group_name들"]
  }
 ]
}
`;

  const userPrompt = `## 1단계 분석 결과
${JSON.stringify(analysisResult.step1, null, 2)}
  
## 프로젝트 파일 목록
${JSON.stringify(project.structure, null, 2)}

## 프로젝트 파일 내용
${JSON.stringify(project.files, null, 2)}
`;

  return { systemPrompt, userPrompt };
};
