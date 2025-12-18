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
    return nodes
      .map((node) => {
        const indent = '  '.repeat(depth);
        const icon = node.type === 'folder' ? '📁' : '📄';
        let text = `${indent}${icon} ${node.name}`;
        if (node.children && node.children.length > 0) {
          text += '\n' + treeToText(node.children, depth + 1);
        }
        return text;
      })
      .join('\n');
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

## 분석 요청사항
### 1. 아키텍처 패턴 식별
프로젝트의 폴더 구조, 파일 배치, 의존성 관계를 종합적으로 분석하여 사용된 아키텍처 패턴을 식별해주세요.
**분석 방법론:**
1. **폴더 구조 분석**: 폴더명과 계층 구조를 통해 아키텍처 패턴의 특징을 파악
   - 예: domain/, application/, infrastructure/ → DDD 또는 Clean Architecture
   - 예: controllers/, models/, views/ → MVC 패턴
   - 예: ports/, adapters/ → Hexagonal Architecture
   - 예: features/, slices/ → Feature-Sliced Design 또는 Vertical Slice Architecture
2. **의존성 관계 분석**: 폴더 구조와 파일 배치를 통해 레이어 간 의존성 방향 추론
   - 폴더 계층 구조를 통한 의존성 방향 추론
   - 파일명 패턴을 통한 레이어 식별 (예: *Controller.js, *Service.js, *Repository.js)
   - **참고**: 코드 파일 내용은 추출하지 않으므로, 폴더 구조와 파일명을 기반으로 분석
3. **설정 파일 분석**: 프레임워크, 라이브러리 설정을 통해 아키텍처 패턴 추론
   - package.json, pom.xml, requirements.txt 등에서 사용 기술 스택 확인
4. **코드 구조 분석**: 파일명과 폴더 구조를 통해 패턴 식별
   - 파일명 패턴을 통한 역할 추론 (예: *Entity.js, *UseCase.js, *Repository.js)
   - 폴더 구조를 통한 계층 식별
   - **참고**: 코드 파일 내용은 추출하지 않으므로, 파일명과 폴더 구조를 기반으로 분석
**식별할 수 있는 패턴 유형 (예시, 제한적이지 않음):**
- **프론트엔드**: MVC, MVVM, Component-based, Flux/Redux, Clean Architecture, Feature-Sliced Design, Atomic Design, Onion Architecture 등
- **백엔드**: Layered Architecture, DDD, Hexagonal Architecture, Clean Architecture, MVC, Microservices, CQRS, Event Sourcing, Event-Driven Architecture, Service-Oriented Architecture (SOA), Onion Architecture, Vertical Slice Architecture 등
- **풀스택**: Monolithic, Microservices, Serverless, Event-Driven 등
**중요**: 위 목록은 참고용 예시이며, 프로젝트에서 발견되는 모든 아키텍처 패턴을 자유롭게 식별하고 설명해주세요. 여러 패턴이 혼합되어 사용될 수도 있습니다.
### 2. 계층별 레이어 분석
식별된 아키텍처 패턴의 특성에 맞게 각 계층별 레이어를 구분하고, 해당 레이어에 속하는 폴더와 파일을 정확히 매칭해주세요.
**레이어 분석 원칙:**
1. **패턴별 레이어 구조 적용**: 식별된 아키텍처 패턴의 표준 레이어 구조를 따르되, 프로젝트의 실제 구조에 맞게 조정
2. **책임 기반 분류**: 각 레이어의 책임과 역할을 명확히 정의
3. **의존성 방향 고려**: 레이어 간 의존성 관계를 분석하여 올바른 계층 구조 확인
**일반적인 레이어 유형 (패턴에 따라 다를 수 있음):**
**프론트엔드 레이어 예시:**
- **Presentation/View Layer**: UI 컴포넌트, 페이지, 뷰, 템플릿
- **State Management Layer**: 상태 관리 스토어, 컨텍스트, 상태 로직
- **Business Logic Layer**: 서비스, 유틸리티, 비즈니스 로직, 도메인 로직
- **Data Access Layer**: API 클라이언트, 데이터 페칭, 데이터 변환
- **Infrastructure Layer**: 설정, 라우팅, 빌드 설정, 외부 라이브러리 래퍼
**백엔드 레이어 예시:**
- **Presentation/API Layer**: 컨트롤러, 라우터, 미들웨어, DTO, 요청/응답 처리
- **Application/Use Case Layer**: 서비스, 유스케이스, 애플리케이션 로직, 오케스트레이션
- **Domain Layer**: 엔티티, 도메인 모델, 비즈니스 규칙, 도메인 서비스, 리포지토리 인터페이스
- **Infrastructure Layer**: 데이터베이스 접근, 외부 API 연동, 파일 시스템, 외부 서비스 어댑터
- **Data Access Layer**: 리포지토리 구현, ORM 모델, 데이터베이스 스키마, 데이터 매퍼
**특수 패턴의 레이어 예시:**
- **CQRS**: Command Layer, Query Layer, Event Handler Layer
- **Event-Driven**: Event Producer, Event Consumer, Event Store
- **Microservices**: API Gateway, Service Mesh, 각 마이크로서비스별 내부 레이어
- **Feature-Sliced Design**: Features, Entities, Shared, App, Pages, Widgets
**중요**: 프로젝트의 실제 구조를 기반으로 레이어를 정의하세요. 표준 패턴과 다를 수 있으며, 프로젝트만의 독특한 레이어 구조가 있을 수 있습니다.
### 3. 상세 분석 요청
각 레이어에 대해 다음 정보를 제공해주세요:
- 레이어의 역할과 책임
- 해당 레이어에 속하는 폴더와 파일 목록
- 레이어 간의 의존성 관계
- 사용된 기술 스택 및 프레임워크

## 응답 형식 (반드시 JSON만 출력)

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

중요: 반드시 유효한 JSON 형식으로만 응답해주세요. 백틱이나 다른 설명은 포함하지 마세요.
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
            content:
              'You are an expert software architect. Analyze project structures and provide insights about architecture patterns. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'HCX-007',
        ...clovaConfig.defaultParams,
      },
      {
        headers: {
          Authorization: `Bearer ${clovaConfig.apiKey}`,
          'X-NCP-CLOVASTUDIO-REQUEST-ID': `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30초 타임아웃
      },
    );

    console.log(`[${new Date().toISOString()}] AI analysis completed`);
    console.log('AI Response:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] AI analysis failed:`,
      error.message,
    );

    // 상세 에러 정보 로깅
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error(
        'Response data:',
        JSON.stringify(error.response.data, null, 2),
      );
      console.error('Response headers:', error.response.headers);
    }

    const aiError = new Error('AI analysis failed: ' + error.message);
    aiError.code = 'AI_ERROR';
    throw aiError;
  }
}

module.exports = {
  analyzeArchitecture,
  buildPrompt,
};
