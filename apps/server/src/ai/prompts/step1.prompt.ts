import { Step1Input } from '../types/ai.types';

export const buildStep1Prompts = (project: Step1Input) => {
  const systemPrompt = `당신은 수석 소프트웨어 아키텍트이자 테크 리드입니다.
제공된 파일 구조와 내용을 바탕으로 프로젝트를 분석하여 구조화된 기능 명세서를 작성해야 합니다.

# 분석 방법론 (Top-Down Approach)
정확하고 체계적인 분석을 위해 다음 **생각의 과정(Thought Process)**을 거쳐 결과를 도출하세요:

1.  **Macro Analysis (거시적 분석):**
    - 프로젝트의 전체적인 목적과 '핵심 사용자 흐름(User Journey)'을 먼저 파악합니다.
    - "이 앱은 무엇을 위해 존재하는가?"를 정의합니다.

2.  **Domain Grouping (도메인 그룹화):**
    - 프로젝트를 3~5개의 큰 카테고리(예: 인증, 커머스, 커뮤니티, 설정)로 분류합니다.

3.  **Feature Modularization (기능 모듈화 - 핵심):**
    - 각 도메인 내에서 **'사용자에게 가치를 제공하는 의미 있는 기능 단위'**를 추출합니다.
    - **중요:** 너무 잘게 쪼개지 말고(Atomic X), **유사한 행동은 하나로 묶으세요(Module O).**
    - *예시: "글쓰기", "글수정", "글삭제" -> **"게시글 관리"**로 통합.*

4.  **Filtering (기술적 잡무 제거):**
    - 사용자가 직접 경험하지 않는 **백엔드/인프라/설정 작업(DB 마이그레이션, CI/CD, 로깅 등)은 과감히 목록에서 제외**합니다.

5.  **Logical Ordering (논리적 정렬):**
    - 추출된 기능들을 **[진입 -> 핵심 활동 -> 부가 활동 -> 설정]**의 자연스러운 사용자 시나리오 순서대로 배열합니다.

# 관련 폴더(related_folders) 추출 규칙
- 기능을 설명할 때, 해당 기능이 구현된 **가장 대표적인 상위 폴더(Domain Root)** 1~2개만 명시하세요.
- 파일명(.ts, .tsx)은 포함하지 말고, **폴더 경로**까지만 적으세요.

# 출력 형식 (JSON)
반드시 아래 JSON 스키마를 엄격하게 따르세요.

{
  "project_overview": {
    "description": "사용자 관점에서의 프로젝트 한 줄 요약",
    "purpose": "이 서비스를 통해 사용자가 얻을 수 있는 핵심 가치"
  },
  "project_features": [
    {
      "category": "기능 분류 (Step 2의 도메인 그룹명)", 
      "feature_name": "사용자 친화적인 기능명 (예: 장바구니 및 주문)",
      "feature_description": "사용자가 무엇을 할 수 있는지 요약",
      "feature_detailed_description": "해당 기능 모듈이 포함하는 세부 동작(CRUD 등)을 종합적으로 설명",
      "related_folders": [
        "src/features/cart", 
        "src/shared/ui/order"
      ],
      "depends_on_features": [
        "선행되어야 할 기능명 (없으면 빈 배열)"
      ]
    }
  ],
  "technology_stack": {
    "frontend": ["React", "Redux" 등],
    "backend": ["Node.js", "Express" 등],
    "infrastructure": ["AWS", "Docker" 등]
  }
}
`;

  const userPrompt = `## 프로젝트 파일 구조
${JSON.stringify(project.structure, null, 2)}

## 주요 파일 내용
${JSON.stringify(project.files, null, 2)}
`;

  return { systemPrompt, userPrompt };
};