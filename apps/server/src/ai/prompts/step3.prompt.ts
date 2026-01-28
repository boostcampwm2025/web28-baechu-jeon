import { Step3Input } from '../types/ai.types';

export const buildStep3Prompts = ({ analysisResult, project }: Step3Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계(주요 파일 추천)와 2단계(폴더 역할 가설) 결과를 종합하여, 이 프로젝트의 거시적인 **의도(Intent)**와 **사용자 시나리오(User Stories)**를 도출해야 합니다.

# 분석 지침

## 1. 프로젝트 의도 (Project Intent)
- **Overview & Purpose:** 프로젝트의 전반적인 개요와 목적을 명확히 요약하세요.
- **Architectural Tendencies:** 프로젝트의 아키텍처 패턴이나 구조적 특징(예: 레이어드 아키텍처, 컴포넌트 기반 등)을 한 줄로 설명하세요.
- **Key Features:** 핵심 기능 3~5가지를 나열하세요.
- **Evidence & Confidence:** 분석의 근거와 신뢰도를 평가하세요.

## 2. 사용자 스토리 (User Stories)
- **Actor 필드 없이**, 실제 사용 시나리오를 문장 형태로 작성하세요.
- **Story:** "사용자는 검색 필터를 통해 원하는 상품을 찾을 수 있다" 또는 "관리자는 대시보드에서 매출 통계를 확인한다"와 같이 **행동과 목적이 드러나는 문장**으로 작성하세요.
- **related_folders:** 해당 유즈케이스(스토리)와 관련된 폴더 경로만 넣으세요. **반드시 2단계 \`responsibility_hypotheses\`에 나온 \`folder_path\` 값만** 사용하세요. 2단계 폴더 목록에 없는 경로는 넣지 마세요.
- **Rationale:** 해당 스토리가 도출된 기술적 근거(관련 파일, 폴더, 기능명)를 명시하세요.

# 출력 형식 (JSON)
반드시 다음 JSON 형식을 정확히 따르세요. (마크다운 없이 JSON만 반환)

{
  "project_intent": {
    "overview": "프로젝트 개요 (한글)",
    "purpose": "프로젝트의 핵심 목적 (한글)",
    "architectural_tendencies": "아키텍처 성향 및 구조적 특징 요약",
    "key_features": ["핵심 기능 1", "핵심 기능 2"],
    "technology_stack": {
      "frontend": ["기술 스택"],
      "backend": ["기술 스택"],
      "infrastructure": ["기술 스택"],
      "database": ["기술 스택"],
      "extra": ["기술 스택"]
    },
    "evidence": ["근거 1 (README)", "근거 2 (구조적 특징)"],
    "confidence": "low" | "medium" | "high"
  },
  "user_stories": [
    {
      "story": "사용자 스토리 문장 (예: 로그인 후 자신의 프로필을 수정할 수 있다)",
      "related_folders": ["2단계 folder_path 값 1", "2단계 folder_path 값 2"],
      "rationale": "도출 근거 (예: UserController의 updateProfile 메서드 존재)"
    }
  ]
}
`;

  const userPrompt = `
## 1단계 분석 결과 (주요 파일 추천)
${JSON.stringify(analysisResult.step1, null, 2)}

## 2단계 분석 결과 (폴더 역할 가설)
${JSON.stringify(analysisResult.step2, null, 2)}

## 프로젝트 파일 목록
${JSON.stringify(project.structure, null, 2)}

## 주요 파일 내용
${JSON.stringify(project.files, null, 2)}
`;

  return { systemPrompt, userPrompt };
};
