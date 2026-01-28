import { Step2Input } from '../types/ai.types';

// TODO: systemPrompt 다듬기

export const buildStep2Prompts = ({
  analysisResult,
  project,
  additionalFileContents,
}: Step2Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계(주요 파일 추천) 결과, 프로젝트 구조, 그리고 파일 내용을 바탕으로, **도메인·기능 단위의 주요 폴더**가 프로젝트 내에서 어떤 역할을 하는지 **자세히** 설명해야 합니다. 단, 트리 구조로 보여줄 때 **상위 폴더 노드를 클릭해도 상세 정보를 줄 수 있도록**, 주요 폴더뿐 아니라 **그 상위 폴더들도** \`responsibility_hypotheses\`에 포함하고 각각 hypothesis를 작성하세요.

# 분석 목표
- **도메인·기능 단위**에서 의미 있는 폴더(예: 도메인 폴더, src/components·api·utils 등)를 주요 폴더로 골라 설명하세요. 1단계 \`project_main_files\`는 참고용으로 활용하되, 꼭 그 파일들의 상위 폴더만일 필요는 없습니다.
- **상위 폴더도 반드시 포함:** 주요 폴더만 넣지 말고, 그 주요 폴더의 **상위 경로에 있는 폴더들**까지 \`responsibility_hypotheses\`에 넣고, 각 폴더마다 \`hypothesis\`를 채우세요. 그래야 트리에서 상위 노드(src, src/components 등)를 클릭했을 때도 표시할 상세 정보가 있습니다.
- 각 폴더가 **어떤 역할을 하는지**, 해당 폴더의 코드/구조를 반영해 **구체적으로** 2~4문장 분량으로 서술하세요.

# 중요 제약 사항 (반드시 준수)
1. **대상은 '폴더'이며, 주요 폴더 + 그 상위 경로 (단, 루트 제외):**
   - \`folder_path\`에는 파일명(.ts, .js 등)을 넣지 말고, **폴더 경로**만 사용하세요.
   - **\`.\`(루트)·프로젝트 최상위 디렉토리는 포함하지 마세요.** 빌드/스크립트만 있는 루트는 제외하고, apps·src·packages 같은 실제 코드 단위부터 포함하세요.
   - 도메인·기능 단위의 **주요 폴더**와, 그 폴더들의 **상위 폴더**(해당 경로까지)를 포함하세요. 불필요한 깊은 세부 폴더만 과도하게 나열하지 마세요.

2. **hypothesis 작성 요령:**
   - \`hypothesis\`에는 이 폴더가 담당하는 일, 대표적인 파일/역할, 다른 부분과의 관계 등을 **2~4문장으로 자세히** 서술하세요. 개발 경험이 적은 사람도 이해할 수 있게 작성하세요.

3. **1단계·주요 파일 내용 활용:**
   - "1단계에서 요청한 주요 파일 내용"에 들어 있는 소스/설정을 참고해, \`hypothesis\`에 **구체적인 예시나 키워드**를 포함하세요.

4. **신뢰도(confidence):**
   - 근거가 명확하면 "high", 추측이 섞여 있으면 "medium", 정보가 부족하면 "low"로 두세요.

# 출력 형식 (JSON)
반드시 다음 JSON 형식을 정확히 따르세요. (마크다운 없이 JSON만 반환)

{
  "responsibility_hypotheses": [
    {
      "folder_path": "폴더 경로",
      "hypothesis": "이 폴더가 담당하는 일, 대표적인 파일/역할 등을 2~4문장으로 자세히 서술",
      "evidence": "설명의 근거 (관련 파일명·분류 등)",
      "confidence": "low" | "medium" | "high"
    }
  ]
}
`;

  const contents: Record<string, string> = additionalFileContents ?? {};
  const userPrompt = `## 1단계 분석 결과 (주요 파일 추천)
${JSON.stringify(analysisResult.step1, null, 2)}

## 프로젝트 파일 목록
${JSON.stringify(project.structure, null, 2)}

## 기존 파일 내용 (리드미, 패키지, 테스트 등)
${JSON.stringify(project.files, null, 2)}

## 1단계에서 요청한 주요 파일 내용
${JSON.stringify(contents, null, 2)}`;

  return { systemPrompt, userPrompt };
};
