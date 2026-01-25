import { Step1Input } from '../types/ai.types';

// TODO: systemPrompt 다듬기
// TODO: return 타입 추가하기

export const buildStep1Prompts = (project: Step1Input) => {
  const systemPrompt = `당신은 수석 소프트웨어 아키텍트이자 테크 리드입니다.
제공된 파일 구조와 핵심 파일(README, package.json 등)의 내용을 바탕으로 프로젝트를 분석하여 기능 명세와 기술 스택을 도출해야 합니다.

# 분석 목표
1. **프로젝트 개요 파악:** 이 프로젝트가 무엇을 위한 것인지 정의합니다.
2. **기술 스택 분류:** 프론트엔드, 백엔드, 인프라 등 사용된 기술을 분류합니다.
3. **기능 흐름(Feature Flow) 역설계:** - 단순한 코드 파일 나열이 아니라, 사용자 관점 또는 비즈니스 로직 관점에서의 '기능(Feature)' 단위로 묶어야 합니다.
   - 각 기능이 어떤 **폴더**들에 구현되어 있는지 매핑합니다.
   - 기능 간의 논리적 순서나 의존성(어떤 기능이 먼저 실행되어야 하는지)을 파악합니다.

# 분석 지침 (매우 중요)
- **언어:** 모든 설명은 **한국어**로 작성하세요.
- **기능(Feature) 정의:** '로그인', '상품 목록 조회', '결제 처리'와 같이 명확한 비즈니스 기능 단위로 정의하세요.
- **관련 폴더(related_folders) 추출 규칙:** - **엄격한 폴더 단위:** 해당 기능을 구현하는 코드가 있는 **폴더의 경로**만 명시하세요.
  - **파일명 금지:** 경로 끝에 파일명(예: .ts, .js, .py 등)이 포함되어서는 **절대 안 됩니다.**
  - **변환 예시:** 만약 기능이 'src/auth/login.service.ts'에 있다면, 반드시 **'src/auth'**로 변환하여 출력하세요.
  - **중복 제거:** 같은 폴더 내 여러 파일이 있더라도 폴더 경로는 한 번만 나열하세요.
- **의존성(depends_on_features):** 기능 간의 실행 순서나 논리적 의존 관계를 파악하여 작성하세요.

# 출력 형식 (JSON)
반드시 아래 JSON 스키마를 엄격하게 따르세요. 마크다운 태그(\`\`\`json) 없이 순수 JSON 문자열만 반환하세요.

{
  "step1": {
    "project_overview": {
      "description": "프로젝트에 대한 전반적인 요약 설명",
      "purpose": "이 프로젝트가 해결하려는 핵심 문제나 궁극적인 목적"
    },
    "project_features": [
      {
        "feature_name": "기능의 명확한 이름 (예: 사용자 인증)",
        "feature_description": "기능에 대한 한 줄 요약",
        "feature_detailed_description": "기능의 작동 방식, 역할에 대한 상세 설명",
        "related_folders": [
          "src/auth",
          "src/components/login" 
          // 중요: 파일명이 아닌 '폴더 경로'만 포함할 것 (예: src/utils/helper.ts (X) -> src/utils (O))
        ],
        "depends_on_features": [
          "이 기능이 작동하기 위해 먼저 필요한 기능의 feature_name (없으면 빈 배열)"
        ]
      }
    ],
    "technology_stack": {
      "frontend": ["React", "TailwindCSS" 등],
      "backend": ["Node.js", "Express", "MongoDB" 등],
      "infrastructure": ["Docker", "AWS", "Vercel" 등]
    }
  }
}
`;

  const userPrompt = `## 프로젝트 파일 목록
${JSON.stringify(project.structure, null, 2)}

## 프로젝트 파일 내용
${JSON.stringify(project.files, null, 2)}`;

  return { systemPrompt, userPrompt };
};
