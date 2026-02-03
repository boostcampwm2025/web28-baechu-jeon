/**
 * Gemini structured output용 JSON Schema.
 * Step별 응답 형식을 강제해 파싱 에러를 줄이기 위해 사용.
 */

/** Step1 응답: project_main_files */
export const STEP1_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    project_main_files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: '프로젝트 내 파일 경로' },
          evidence: { type: 'string', description: '해당 파일이 중요한 이유' },
          confidence: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: '신뢰도',
          },
        },
        required: ['file_path', 'evidence', 'confidence'],
      },
    },
  },
  required: ['project_main_files'],
} as const;

/** Step2 응답: responsibility_hypotheses, project_intent, user_stories */
export const STEP2_AND_3_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    responsibility_hypotheses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '폴더 또는 파일 경로' },
          hypothesis: { type: 'string', description: '역할 가설' },
          confidence: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: '신뢰도',
          },
        },
        required: ['path', 'hypothesis', 'confidence'],
      },
    },
    project_intent: {
      type: 'object',
      properties: {
        overview: { type: 'string', description: '프로젝트 개요' },
        purpose: { type: 'string', description: '목적' },
        architectural_tendencies: {
          type: 'string',
          description: '아키텍처 경향',
        },
        key_features: {
          type: 'array',
          items: { type: 'string' },
          description: '주요 기능 목록',
        },
        technology_stack: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: { type: 'string' },
          },
          description: '기술 스택 (키: 카테고리, 값: 항목 배열)',
        },
        confidence: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: '신뢰도',
        },
      },
      required: [
        'overview',
        'purpose',
        'architectural_tendencies',
        'key_features',
        'technology_stack',
        'confidence',
      ],
    },
    user_stories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          story: { type: 'string', description: '사용자 스토리' },
          related_paths: {
            type: 'array',
            items: { type: 'string' },
            description: '관련 파일 경로',
          },
          rationale: { type: 'string', description: '근거' },
        },
        required: ['story', 'related_paths', 'rationale'],
      },
    },
  },
  required: ['responsibility_hypotheses', 'project_intent', 'user_stories'],
} as const;

/** Step3 코드요약 응답: file_summaries */
export const STEP3_CODE_SUMMARY_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    file_summaries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: '파일 경로' },
          markdown_content: {
            type: 'string',
            description: '코드 설명 (마크다운)',
          },
        },
        required: ['file_path', 'markdown_content'],
      },
    },
  },
  required: ['file_summaries'],
} as const;
