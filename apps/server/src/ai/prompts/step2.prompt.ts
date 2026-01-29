import { Step2Input } from '../types/ai.types';

export const buildStep2Prompts = ({
  analysisResult,
  project,
  additionalFileContents,
}: Step2Input) => {
  const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다.
1단계(주요 파일 추천) 결과, 프로젝트 구조, 그리고 파일 내용을 바탕으로 **폴더**와 **주요 파일**이 프로젝트 내에서 어떤 역할을 하는지 설명해야 합니다. \`path\`에는 **폴더 경로**와 **1단계 project_main_files에 있는 파일 경로**를 모두 넣습니다.

**중요 제한:**
- **폴더 path는 반드시 40개 이하.** 파일 path는 \`project_main_files\` 중 아래 "트리 범위" 안에 있는 것만 넣습니다.
- **트리 범위:** path에는 **실제 애플리케이션/서비스 소스 코드**가 들어 있는 폴더·파일만 포함하세요. **제외할 것:** 설정·CI·배포·스크립트·인프라 전용 폴더(예: \`.github\`, \`scripts\`, Docker/nginx 설정용 폴더)와 루트 설정 파일(예: \`docker-compose.yml\`, \`compose.local.yml\`). 프로젝트 구조가 모노레포인지 단일 앱인지에 따라 "앱 코드 영역"이 다르므로, **비즈니스/앱 소스가 있는 경로만** 포함하면 됩니다.
- **트리 연결 필수:** 넣는 **모든 path(폴더·파일)에 대해, 그 path의 상위 경로(부모, 조부모, … 최상위까지)도 반드시 responsibility_hypotheses에 포함**하세요. 예: \`apps/frontend/src/entities/node/model\`을 넣으면 \`apps/frontend/src/entities/node\`, \`apps/frontend/src/entities\`, \`apps/frontend/src\`, \`apps/frontend\`도 리스트에 있어야 합니다. **중간 경로를 생략하면 해당 하위 노드들이 트리에서 붕 떠 보이므로, 상위 경로를 누락하지 마세요.**

# 분석 대상
1. **폴더:** 트리는 **"앱/서비스 코드의 최상위" → 그 하위**로만 그립니다. **40개 이하**, 트리 범위 밖 path는 넣지 마세요.
   - **(1) 최상위 폴더 먼저:** 프로젝트 구조를 보고 **실제 앱/서비스 소스가 시작되는 폴더**를 최상위로 잡으세요. 모노레포면 \`apps\`, \`packages\` 같은 컨테이너가 있을 수 있는데, **컨테이너 단독 path는 넣지 말고** 그 **직하위 앱·서비스 폴더**(이름은 프로젝트마다 다름: backend, frontend, server, web, api 등)를 최상위로 넣으세요. 컨테이너와 같은 계층의 \`.github\`, \`scripts\`, 인프라용 폴더는 제외. **단일 앱**이면 \`src\` 또는 해당 앱 루트 하나를 최상위로.
   - **(2) 최상위와 1단계 파일 사이 폴더:** 각 \`project_main_files\` 경로에서 **위에서 정한 최상위 폴더부터 그 파일까지** 사이에 있는 모든 폴더를 포함하세요.
   - **(3) 그 외 중요한 중간 폴더:** 1단계 파일 경로에 직접 없지만, 같은 앱/서비스 안에서 프로젝트 이해에 중요한 폴더만 필요한 만큼 추가하세요.
   - **40개 초과 시:** (3)에서 넣은 폴더부터 줄이거나, (2)에서 깊은 하위 폴더 중 덜 중요한 것을 생략해 40개 이하로 맞추세요.
2. **파일:** 1단계 \`project_main_files\` 중 **위에서 정한 "앱/서비스 코드 영역" 안에 있는 경로만** \`path\`에 넣으세요. 설정·CI·스크립트·인프라 전용 파일은 responsibility_hypotheses에 넣지 마세요. 넣은 파일마다 hypothesis를 작성하세요.

# path 필드
- \`path\`는 **폴더 경로** 또는 **파일 경로**입니다. 폴더일 때는 확장자 없음, 파일일 때는 예: src/app/page.tsx 형태입니다.


# hypothesis 작성 (마크다운 형식)
- \`hypothesis\`는 **해당 폴더 또는 파일에 대한 자세한 설명**을 **마크다운**으로 작성하세요. 코드 스니펫 위주가 아니라, **역할·목적·내용을 설명하는 문장**이 중심이 되도록 하세요.
- 읽기 쉽게 제목(\`## 역할\`, \`## 요약\` 등), 리스트(\`-\`), 강조(\`**볼드**\`, 인라인 코드 \`파일명\`)를 활용하세요.
- 이 폴더나 파일이 프로젝트에서 맡는 역할, 어떤 기능/도메인을 담당하는지, 대표 파일이나 다른 부분과의 관계를 2~4문장으로 서술. 너무 길지 않게.

- 개발 경험이 적은 사람도 이해할 수 있게 작성하세요.

# 기타
- "1단계에서 요청한 주요 파일 내용"을 참고해 구체적인 예시나 키워드를 hypothesis에 반영하세요.
- **confidence:** 근거가 명확하면 "high", 추측이 섞이면 "medium", 정보가 부족하면 "low".

# 출력 형식 (JSON)
반드시 다음 JSON 형식을 정확히 따르세요. (마크다운 없이 JSON만 반환. hypothesis 안의 마크다운은 이스케이프된 문자열로 넣으세요.)
- **폴더 path는 최대 40개만.** 설정·CI·스크립트·인프라 전용 폴더/파일은 넣지 말고, **path는 모두 "앱/서비스 소스 코드 영역" 안**인지 확인하세요. **각 path의 부모·조부모·… 최상위까지 모두 리스트에 있어야** 트리가 끊기지 않습니다. 출력 전에 상위 경로 누락이 없는지 검토하세요.

{
  "responsibility_hypotheses": [
    {
      "path": "폴더 또는 파일 경로 (폴더는 40개 이하)",
      "hypothesis": "해당 폴더/파일에 대한 자세한 설명 (마크다운, 적당한 길이)",
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
