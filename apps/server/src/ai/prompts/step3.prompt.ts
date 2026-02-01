import { Step3CodeSummaryInput } from '../types/ai.types';

export const buildStep3Prompts = ({
  analysisResult,
  project,
  fileContents,
}: Step3CodeSummaryInput) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계에서 추천된 **주요 파일**의 소스코드를 보고, 각 파일마다 **코드 설명 문서**를 **마크다운**으로 작성해야 합니다. 이 문서는 "코드 설명" 탭에서 그대로 보여질 예정입니다.

# 분석 대상
- 제공된 "주요 파일 소스코드"에 포함된 **모든 파일**에 대해 \`file_summaries\`에 항목을 하나씩 넣으세요.
- 각 파일의 \`file_path\`는 제공된 키(경로)와 **완전히 동일**하게 넣으세요.

# markdown_content 작성 요청
각 파일의 \`markdown_content\`는 **두 부분**으로 구성하세요.

**1) 파일 개요 (상단)**  
- 첫 문단: 이 파일이 프로젝트에서 어떤 위치/역할인지 한 문장으로 비유해 설명 (예: "시작점", "중앙 허브", "~를 담당하는 곳" 등). 초보 개발자도 이해할 수 있게 쓴다.
- **주요 역할:** 제목 아래에, \`*   **역할 이름**: 구체적 설명\` 형태의 불릿 리스트를 2~5개. 기술 용어는 괄호로 보충하거나 한 줄로 풀어서 설명.
- 마지막: "이 파일을 통해 ~를 알/이해할 수 있습니다."처럼 한 문장으로 정리.

**2) 주요 메서드 (하단, 추가)**  
파일에 정의된 **주요 함수·메서드**를 고르고, 아래를 포함하세요.
- **코드 스니펫**: 해당 메서드/함수의 시그니처와 핵심 구현 일부만 짧게 (10~20줄 이내 권장). \`\`\`코드블록\`\`\`으로 표시.
- **역할 설명**: 그 메서드가 무엇을 하는지 한두 문장으로 간단히 설명.

메서드가 없거나 거의 없는 파일(설정만 있는 파일 등)은 개요만 작성하고 "주요 메서드" 섹션은 생략하거나 "해당 없음"으로 처리해도 됩니다.

- **길이 제한**: 파일당 설명은 **1500자 이내**로 작성하세요. 개요는 간결하게, 메서드 설명은 핵심만 전달하세요.

# 기타
- JSON 응답 시 \`markdown_content\` 안의 줄바꿈은 \\n으로 이스케이프하세요.

# 출력 형식 (JSON)
반드시 다음 JSON 형식을 정확히 따르세요. (마크다운 없이 JSON만 반환)

{
  "file_summaries": [
    {
      "file_path": "제공된 파일 경로와 동일 (예: src/app/page.tsx)",
      "markdown_content": "설명 마크다운 전체 문자열 (줄바꿈은 \\n)"
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
