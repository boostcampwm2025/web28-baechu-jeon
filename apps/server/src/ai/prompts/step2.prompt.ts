import { Step2Input } from '../types/ai.types';

export const buildStep2Prompts = ({
  analysisResult,
  project,
  additionalFileContents,
}: Step2Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계(주요 파일 추천) 결과, 프로젝트 구조, 그리고 파일 내용을 바탕으로 **폴더**와 **주요 파일**이 프로젝트 내에서 어떤 역할을 하는지 설명해야 합니다. \`path\`에는 **폴더 경로**와 **1단계 project_main_files에 있는 파일 경로**를 모두 넣습니다.

# 분석 대상
1. **폴더:** 도메인·기능 단위의 주요 폴더 + 그 상위 폴더(트리에서 상위 노드 클릭 시에도 상세 정보가 있도록). 루트(.)는 제외하고, apps·src·packages 같은 실제 코드 단위부터 포함하세요.
2. **파일:** 1단계 \`project_main_files\`에 나열된 **파일 경로만** 포함하세요. 이 파일들은 "1단계에서 요청한 주요 파일 내용"으로 소스가 제공되므로, 이 경로들을 \`path\`에 넣고 각각 hypothesis를 작성하세요. 목록에 없는 파일은 추가하지 마세요.

# path 필드
- \`path\`는 **폴더 경로** 또는 **파일 경로**입니다. 폴더일 때는 확장자 없음, 파일일 때는 예: src/app/page.tsx 형태입니다.
- 폴더는 주요 폴더 + 그 상위 경로만. 파일은 1단계에서 추천된 파일만.

# hypothesis 작성 (마크다운 형식)
- \`hypothesis\`는 **마크다운**으로 작성하세요. 읽기 쉽게 다음을 활용하세요.
  - 제목: \`## 역할\`, \`## 주요 파일\`, \`## 주요 코드\` 등
  - 리스트: \`-\`, \`*\`
  - 코드 스니펫: \`\`\`언어 ... \`\`\`
  - 강조: \`**볼드**\`, 인라인 코드 \`파일명\`
- 폴더: 해당 폴더의 역할, 대표 파일/역할, 다른 부분과의 관계를 2~4문장 분량으로 서술.
- 파일: 해당 파일의 역할, 주요 코드나 로직을 간단히 요약. 가능하면 코드 블록으로 핵심 한두 줄 포함.
- 개발 경험이 적은 사람도 이해할 수 있게 작성하세요.

# 기타
- "1단계에서 요청한 주요 파일 내용"을 참고해 구체적인 예시나 키워드를 hypothesis에 반영하세요.
- **confidence:** 근거가 명확하면 "high", 추측이 섞이면 "medium", 정보가 부족하면 "low".

# 출력 형식 (JSON)
반드시 다음 JSON 형식을 정확히 따르세요. (마크다운 없이 JSON만 반환. hypothesis 안의 마크다운은 이스케이프된 문자열로 넣으세요.)

{
  "responsibility_hypotheses": [
    {
      "path": "폴더 또는 파일 경로",
      "hypothesis": "마크다운 형식의 설명 (제목, 리스트, 코드블록 등 활용)",
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
