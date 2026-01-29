import { Step4Input } from '../types/ai.types';

export const buildStep4Prompts = ({
  analysisResult,
  project,
  fileContents,
}: Step4Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계에서 추천된 **주요 파일**의 소스코드를 보고, 각 파일마다 **코드 설명 문서**를 **마크다운**으로 작성해야 합니다. 이 문서는 "코드 설명" 탭에서 그대로 보여질 예정이므로, 읽기 쉽고 구조화된 형식으로 작성하세요.

# 분석 대상
- 제공된 "주요 파일 소스코드"에 포함된 **모든 파일**에 대해 \`file_summaries\`에 항목을 하나씩 넣으세요.
- 각 파일의 \`file_path\`는 제공된 키(경로)와 **완전히 동일**하게 넣으세요.

# markdown_content 작성 형식 (마크다운)
각 파일의 \`markdown_content\`는 아래 구조를 따르세요. 개발 경험이 적은 사람도 이해할 수 있게 작성하세요.

1. **파일 개요**
   - \`# 파일 개요\` 제목 아래, 이 파일이 무엇을 하는지 2~4문장으로 요약.

2. **주요 기능**
   - \`## 주요 기능\` 제목 아래, \`-\` 리스트로 핵심 역할 3~5개 나열.

3. **주요 코드**
   - \`## 주요 코드\` 제목 아래, **코드 블록 → 설명**을 반복하세요.
   - 예: \`### 1. 컴포넌트 진입점\` → \`\`\`언어 ... 코드 몇 줄\`\`\` → "이 코드는 ..." 설명.
   - 다음: \`### 2. 데이터 로딩 로직\` → 코드 블록 → 설명. 이렇게 핵심 로직·함수·클래스별로 나누어 작성.
   - 코드는 **실제 소스에서 발췌**하고, 설명은 그 코드가 하는 일을 한두 문장으로 서술.

4. **의존성** (선택)
   - \`## 의존성\` 제목 아래, 이 파일에서 사용하는 주요 훅·라이브러리·모듈을 리스트로 정리.

# 기타
- 마크다운 문법(제목, 리스트, 코드블록, **볼드**, 인라인 \`코드\`)을 활용해 가독성을 높이세요.
- JSON 응답 시 \`markdown_content\` 안의 줄바꿈은 \\n으로 이스케이프하세요.

# 출력 형식 (JSON)
반드시 다음 JSON 형식을 정확히 따르세요. (마크다운 없이 JSON만 반환)

{
  "file_summaries": [
    {
      "file_path": "제공된 파일 경로와 동일 (예: src/app/page.tsx)",
      "markdown_content": "위 형식에 맞춘 마크다운 전체 문자열 (줄바꿈은 \\n)"
    }
  ]
}
`;

  const userPrompt = `## 1단계 분석 결과 (주요 파일 목록)
${JSON.stringify(analysisResult.step1, null, 2)}

## 주요 파일 소스코드 (경로 -> 내용)
${JSON.stringify(fileContents, null, 2)}

## 프로젝트 파일 목록 (참고)
${JSON.stringify(project.structure, null, 2)}
`;

  return { systemPrompt, userPrompt };
};
