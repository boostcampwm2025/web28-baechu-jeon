const axios = require('axios');
const clovaConfig = require('../config/clova');

/**
 * AI 분석용 프롬프트 생성
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @returns {string}
 */
function buildPrompt(parsedData) {
  const { tree, contents } = parsedData;

  // 파일 트리를 간단한 텍스트 형태로 변환
  function treeToText(nodes, depth = 0) {
    return nodes.map(node => {
      const indent = '  '.repeat(depth);
      const icon = node.type === 'folder' ? '📁' : '📄';
      let text = `${indent}${icon} ${node.name}`;
      if (node.children && node.children.length > 0) {
        text += '\n' + treeToText(node.children, depth + 1);
      }
      return text;
    }).join('\n');
  }

  const treeText = treeToText(tree);

  // 주요 설정 파일 내용
  const contentsText = Object.entries(contents)
    .map(([path, content]) => {
      return `### ${path}\n\`\`\`\n${content}\n\`\`\``;
    })
    .join('\n\n');

  return `
# 프로젝트 구조 분석 요청

다음 프로젝트의 아키텍처를 분석해주세요.

## 1. 폴더/파일 구조
${treeText}

## 2. 주요 설정 파일 내용
${contentsText}

## 분석 요청 사항

다음 항목들을 JSON 형식으로 분석해주세요:

1. **아키텍처 타입 및 패턴 식별**
   다음 중 해당하는 아키텍처를 모두 선택하고 설명해주세요:

   프론트엔드:
   - MVC, MVP, MVVM
   - Component-Based Architecture
   - Atomic Design
   - Feature-Based Architecture
   - Domain-Based Architecture
   - Micro Frontends
   - Monorepo Architecture

   백엔드:
   - Layered Architecture
   - Hexagonal Architecture (Ports & Adapters)
   - Clean Architecture
   - Domain-Driven Design (DDD)
   - Microservices Architecture
   - Event-Driven Architecture
   - Serverless Architecture

   프론트-백엔드 연계:
   - BFF (Backend For Frontend)
   - API Gateway Architecture

2. **아키텍처 레이어 분류**
   각 폴더가 속한 레이어를 분류해주세요.
   예: Presentation Layer, Business Logic Layer, Data Layer, Infrastructure Layer 등

3. **시각화 데이터**
   각 레이어를 노드로, 레이어 간 의존성을 엣지로 표현해주세요.

## 응답 형식 (반드시 JSON만 출력)

\`\`\`json
{
  "architecture": {
    "type": "주요 아키텍처 타입",
    "patterns": ["적용된 패턴들"],
    "description": "아키텍처에 대한 설명 (2-3줄)"
  },
  "layers": [
    {
      "name": "레이어 이름",
      "paths": ["해당 레이어에 속하는 폴더 경로들"],
      "description": "레이어의 역할",
      "technicalDetails": "사용된 기술 스택"
    }
  ],
  "visualization": {
    "nodes": [
      {
        "id": "고유ID",
        "label": "표시할이름",
        "type": "frontend | backend | shared | config",
        "layer": "레이어이름"
      }
    ],
    "edges": [
      {
        "from": "시작노드ID",
        "to": "도착노드ID",
        "relationship": "관계설명"
      }
    ]
  }
}
\`\`\`

중요: 반드시 유효한 JSON 형식으로만 응답해주세요. 다른 설명은 포함하지 마세요.
`;
}

/**
 * Clova Studio API 호출
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @returns {Promise<Object>}
 */
async function analyzeArchitecture(parsedData) {
  try {
    console.log(`[${new Date().toISOString()}] Starting AI analysis...`);

    const prompt = buildPrompt(parsedData);

    const response = await axios.post(
      clovaConfig.apiUrl,
      {
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect. Analyze project structures and provide insights about architecture patterns. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        ...clovaConfig.defaultParams
      },
      {
        headers: {
          'X-NCP-CLOVASTUDIO-API-KEY': clovaConfig.apiKey,
          'X-NCP-APIGW-API-KEY': clovaConfig.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30초 타임아웃
      }
    );

    console.log(`[${new Date().toISOString()}] AI analysis completed`);

    return response.data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] AI analysis failed:`, error.message);

    const aiError = new Error('AI analysis failed: ' + error.message);
    aiError.code = 'AI_ERROR';
    throw aiError;
  }
}

module.exports = {
  analyzeArchitecture,
  buildPrompt
};
