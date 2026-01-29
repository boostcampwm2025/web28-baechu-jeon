import { Step4Input } from '../types/ai.types';

export const buildStep4Prompts = ({
  analysisResult,
  project,
  fileContents,
}: Step4Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계에서 추천된 **주요 파일**의 소스코드를 보고, 각 파일마다 **코드 설명 문서**를 **마크다운**으로 작성해야 합니다. 이 문서는 "코드 설명" 탭에서 그대로 보여질 예정입니다.

# 분석 대상
- 제공된 "주요 파일 소스코드"에 포함된 **모든 파일**에 대해 \`file_summaries\`에 항목을 하나씩 넣으세요.
- 각 파일의 \`file_path\`는 제공된 키(경로)와 **완전히 동일**하게 넣으세요.

# markdown_content 작성 요청
각 파일의 \`markdown_content\`에는 **초보 개발자도 해당 파일을 이해할 수 있도록** 설명을 작성하세요. 형식은 정하지 않으니, 그 파일을 이해하는 데 가장 도움이 되도록 자유롭게 구성하세요. 필요하면 제목·리스트·코드 블록·볼드 등 마크다운을 활용해 읽기 쉽게 작성하면 됩니다.
- **길이 제한**: 파일당 설명은 **1000자 이내**로 작성하세요. 핵심만 간결하게 전달하고 불필요하게 길어지지 않도록 하세요.

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
