const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const USE_MOCK = true; // TODO: 백엔드 구현 후 false로 변경

export interface CodeResponse {
  filePath: string;
  markdownContent: string;
}

export class CodeError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "CodeError";
  }
}

// TODO: 백엔드 구현 후 제거
function getMockMarkdown(filePath: string): string {
  const name = filePath.split("/").pop() ?? "file";

  return `# ${name}

## 파일 개요

이 파일은 프로젝트의 핵심 모듈 중 하나로, 주요 비즈니스 로직을 담당합니다.

## 주요 기능

- **데이터 처리**: 외부 API로부터 데이터를 수신하고 가공합니다
- **상태 관리**: 애플리케이션의 전역 상태를 관리합니다
- **에러 핸들링**: 예외 상황에 대한 처리 로직을 포함합니다

## 의존성

이 파일은 다음 모듈들과 연관되어 있습니다:

| 모듈 | 역할 |
|------|------|
| utils/helper | 유틸리티 함수 제공 |
| services/api | API 통신 담당 |
| stores/state | 전역 상태 접근 |

## 참고 사항

> 이 파일은 분석 대상에 포함된 주요 파일입니다.
> 향후 리팩토링 시 모듈 분리를 고려해 주세요.
`;
}

export async function getCode(
  analysisId: string,
  filePath: string,
  signal?: AbortSignal,
): Promise<CodeResponse> {
  if (USE_MOCK) {
    return { filePath, markdownContent: getMockMarkdown(filePath) };
  }

  const response = await fetch(
    `${API_BASE_URL}/code/${analysisId}?filePath=${encodeURIComponent(filePath)}`,
    { method: "GET", signal },
  );
  if (!response.ok) throw new CodeError("Fetch failed", response.status);
  return response.json();
}
