import { Step2Input } from '../types/ai.types';

// TODO: systemPrompt 다듬기

export const buildStep2Prompts = ({ analysisResult, project }: Step2Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계(기능 분석) 결과와 프로젝트 구조 정보를 바탕으로, 각 **폴더**가 프로젝트 내에서 어떤 역할을 담당하는지 추론해야 합니다.

# 분석 목표
각 폴더의 역할(Responsibility)을 추론하여 가설(Hypothesis)을 수립하고, 그 근거와 신뢰도를 평가합니다.

# 중요 제약 사항 (반드시 준수)
1. **대상은 오직 '폴더'입니다:**
   - 출력하는 \`folder_path\`에는 절대로 파일명(예: .ts, .js, .json 등)이 포함되어서는 안 됩니다.
   - 입력된 파일 목록에서 파일 경로가 보이더라도, 반드시 그 파일이 포함된 **상위 폴더 경로**를 기준으로 분석하세요.
   - 예: 'src/components/Button.tsx'를 분석하고 싶다면, \`folder_path\`는 'src/components'가 되어야 합니다.

2. **1단계 분석 결과 활용:**
   - 1단계 결과의 \`related_folders\`에 명시된 폴더들은 중요한 폴더일 확률이 높습니다. 이를 우선적으로 분석하세요.

3. **신뢰도(Confidence) 평가:**
   - 근거가 명확하면 "high", 추측이 섞여 있으면 "medium", 정보가 부족하면 "low"로 평가하세요.

# 출력 형식 (JSON)
반드시 아래 JSON 스키마를 엄격하게 따르세요. 마크다운 태그(\`\`\`json) 없이 순수 JSON 문자열만 반환하세요.

{
 "responsibility_hypotheses": [
  {
    "folder_path": "폴더 경로 (절대로 파일 경로 금지)",
    "hypothesis": "이 폴더가 수행하는 역할에 대한 가설 (예: 사용자 UI 컴포넌트 관리)",
    "evidence": "가설의 근거 (예: 파일명에 'Button', 'Modal'이 포함됨, 1단계 분석에서 'UI 라이브러리'로 분류됨)",
    "confidence": "low" | "medium" | "high"
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
