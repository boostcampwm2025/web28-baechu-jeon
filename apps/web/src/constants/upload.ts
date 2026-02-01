export const TAB_LABELS = {
  ZIP: "ZIP 파일 업로드",
  GITHUB: "GitHub 링크 업로드",
} as const;

export const ZIP_UPLOAD = {
  DRAG_DROP_TITLE: "드래그앤드롭",
  DRAG_DROP_SUBTITLE: "또는 클릭하여 파일 선택 (ZIP, 최대 300MB)",
  FILE_EXTENSION: ".zip",
  WARNING_TITLE: "압축 파일은 분석 후 즉시 파기됩니다.",
  WARNING_SUBTITLE: "보안을 위해 민감 정보는 제거해주세요.",
  SUBMIT_BUTTON: "분석 시작하기",
  MAX_FILE_SIZE: 300 * 1024 * 1024,
  ERROR_FILE_TOO_LARGE:
    "파일 크기가 너무 큽니다. 최대 300MB까지 업로드 가능합니다.",
  ERROR_INVALID_TYPE: "ZIP 파일만 업로드 가능합니다.",
} as const;

export const GITHUB_UPLOAD = {
  LABEL: "REPOSITORY URL",
  PLACEHOLDER: "https://github.com/username/repo",
  PUBLIC_NOTICE: "Public Repository만 분석 가능합니다",
  WARNING_MESSAGE: "분석된 코드는 저장되지 않으며 작업 후 즉시 파기됩니다. ",
  SUBMIT_BUTTON: "분석 시작하기",
} as const;

export const FILE_SIZE = {
  ZERO: "0 Bytes",
  UNITS: ["Bytes", "KB", "MB", "GB"],
  BASE: 1024,
} as const;
