import { Step1Input } from '../types/ai.types';

export const buildStep1Prompts = (project: Step1Input) => {
  const systemPrompt = `당신은 수석 소프트웨어 아키텍트입니다.
제공된 **파일 목록**과 **일부 파일 내용**(리드미, package.json, 테스트 코드 등)을 보고, 이 프로젝트를 더 정확히 이해하기 위해 **추가로 꼭 봐야 할 주요 파일**을 골라 주세요.

# 분석 목표
- 현재 제공된 정보만으로는 프로젝트의 역할·구조·의도를 완전히 파악하기 어렵습니다.
- "이 파일의 내용을 보면 프로젝트 이해에 도움이 된다"고 판단되는 **파일 경로**를 추천하고, **이유(evidence)**와 **신뢰도(confidence)**를 함께 제시하세요.

# 추천 시 유의사항
- **파일 경로**는 반드시 제공된 파일 목록에 존재하는 경로여야 합니다. 상상으로 경로를 만들지 마세요.
- 이미 내용이 제공된 파일(README, package.json, 테스트 파일 등)은 제외해도 됩니다. **아직 내용이 제공되지 않은** 파일 중에서 선택하세요.
- 핵심 진입점(메인 앱, 라우트, 설정), 도메인 로직, 공통 컴포넌트 등 프로젝트 이해에 실질적으로 기여하는 파일을 우선적으로 골라 주세요.
- 개수는 5~20개 정도가 적당합니다. 과하지 않게, 꼭 필요한 것만 골라 주세요.

# 출력 형식 (JSON)


{
  "project_main_files": [
    {
      "file_path": "프로젝트 내 파일 경로 (예: src/app/page.tsx)",
      "evidence": "해당 파일이 중요한 이유 (한 줄 요약)",
      "confidence": "low" | "medium" | "high"
    }
  ]
}
`;

  const userPrompt = `## 프로젝트 파일 목록
${JSON.stringify(project.structure, null, 2)}

## 이미 확인된 파일 내용 (리드미, package, 테스트 등)
${JSON.stringify(project.files, null, 2)}

`;

  return { systemPrompt, userPrompt };
};
