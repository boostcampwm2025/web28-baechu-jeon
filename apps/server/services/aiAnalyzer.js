const axios = require('axios');
const clovaConfig = require('../config/clova');

/**
 * 1단계 시스템 프롬프트 (고정된 지시사항)
 */
const STAGE1_SYSTEM_PROMPT = `당신은 전문 소프트웨어 아키텍트입니다.

STAGE 1: Architecture Pattern & Layer Structure Definition

Instructions:
1. Identify Project Boundaries (frontend, backend, shared, etc.)
2. Determine Architecture Patterns per boundary with evidence
3. Define Layer Structure (5+ layers) per boundary:
   - name: 레이어 이름
   - responsibility: 책임
   - characteristics: 파일 식별 방법
4. Define Dependency Flow per boundary
5. Describe Cross-Boundary Relationships

Output VALID JSON ONLY (no markdown). Respond in Korean.

{
  "boundaries": {
    "boundaryName": {
      "architecturePatterns": [{"name": "패턴", "evidence": ["증거1"]}],
      "layers": [{"name": "레이어", "responsibility": "책임", "characteristics": ["특성"]}],
      "dependencyFlow": "의존성 설명"
    }
  },
  "crossBoundaryInteraction": "경계 간 상호작용"
}

Do NOT map files to layers yet.`;

/**
 * 1단계 유저 프롬프트 (변하는 데이터)
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @returns {string}
 */
function buildFirstStageUserPrompt(parsedData) {
  const { tree, contents } = parsedData;

  // 파일 트리를 텍스트로 변환
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

  // 설정 파일 목록만 (내용 제외 - 토큰 절약)
  const configFiles = Object.keys(contents).join(', ');

  return `# Project Structure
${treeText}

# Configuration Files Found
${configFiles}`;
}

/**
 * 2단계 시스템 프롬프트 (고정된 지시사항)
 */
const STAGE2_SYSTEM_PROMPT = `당신은 레이어 아키텍처 다이어그램 생성을 위해 코드를 분석하는 전문 소프트웨어 아키텍트입니다.

STAGE 2: Complete File-to-Layer Mapping

PURPOSE: Generate data for layer architecture diagram - EVERY file must be mapped.

CRITICAL: Map EVERY file to its layer. Output will be used to draw layer architecture diagram.

Instructions:
- Assign ALL files/folders to layers based on Stage 1 characteristics
- List ALL individual files explicitly for diagram generation

Output VALID JSON ONLY (no markdown). Respond in Korean.

{
  "boundaries": {
    "boundaryName": {
      "layers": [
        {
          "name": "레이어명 (match Stage 1)",
          "folders": ["path1", "path2"],
          "files": ["file1.js", "file2.tsx", ...]
        }
      ]
    }
  },
  "assumptions": ["설명"]
}`;

/**
 * 2단계 유저 프롬프트 (변하는 데이터)
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @param {Object} firstStageResult - 1단계 분석 결과
 * @returns {string}
 */
function buildSecondStageUserPrompt(parsedData, firstStageResult) {
  const { tree } = parsedData;

  // 파일 트리를 텍스트로 변환 (경로 포함)
  function treeToText(nodes, depth = 0, parentPath = '') {
    return nodes
      .map((node) => {
        const indent = '  '.repeat(depth);
        const icon = node.type === 'folder' ? '📁' : '📄';
        const currentPath = parentPath
          ? `${parentPath}/${node.name}`
          : node.name;
        let text = `${indent}${icon} ${node.name} (${currentPath})`;
        if (node.children && node.children.length > 0) {
          text += '\n' + treeToText(node.children, depth + 1, currentPath);
        }
        return text;
      })
      .join('\n');
  }

  const treeText = treeToText(tree);

  return `# Stage 1 Architecture
${JSON.stringify(firstStageResult, null, 2)}

# Project Structure
${treeText}`;
}

/**
 * Clova Studio API 단일 호출 헬퍼
 * @param {string} systemPrompt - 시스템 프롬프트 (고정된 지시사항)
 * @param {string} userPrompt - 유저 프롬프트 (변하는 데이터)
 * @param {string} stageName - 단계 이름 (로깅용)
 * @returns {Promise<Object>}
 */
async function callClovaAPI(systemPrompt, userPrompt, stageName) {
  try {
    console.log(`[${new Date().toISOString()}] Starting ${stageName}...`);

    const response = await axios.post(
      clovaConfig.apiUrl,
      {
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
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
        timeout: 90000,
      },
    );

    console.log(`[${new Date().toISOString()}] ${stageName} completed`);
    return response.data;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ${stageName} failed:`,
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

    const aiError = new Error(`${stageName} failed: ${error.message}`);
    aiError.code = 'AI_ERROR';
    throw aiError;
  }
}

/**
 * AI 응답에서 JSON 추출
 * @param {Object} aiResult - Clova API 응답
 * @returns {Object}
 */
function extractJSON(aiResult) {
  let content = '';
  try {
    // 디버깅: 응답 구조 로깅
    console.log('AI Response keys:', Object.keys(aiResult));
    console.log(
      'AI Response sample:',
      JSON.stringify(aiResult).substring(0, 300),
    );

    if (aiResult.result?.message?.content) {
      content = aiResult.result.message.content;
    } else if (aiResult.message?.content) {
      content = aiResult.message.content;
    } else if (aiResult.choices?.[0]?.message?.content) {
      content = aiResult.choices[0].message.content;
    } else if (aiResult.content) {
      content = aiResult.content;
    } else if (typeof aiResult === 'string') {
      content = aiResult;
    } else {
      console.error('Unknown AI response structure');
      console.error('Full response:', JSON.stringify(aiResult, null, 2));
      return null;
    }

    // JSON 코드블록에서 추출 시도
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // 일반 코드블록에서 추출 시도
    const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
      return JSON.parse(codeMatch[1]);
    }

    // 직접 JSON 파싱 시도
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e.message);
    console.error('Content:', content?.substring(0, 500));
    return null;
  }
}

/**
 * Rate limit 대기 (딜레이)
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 2단계 AI 분석 수행
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @returns {Promise<Object>}
 */
async function analyzeArchitecture(parsedData) {
  try {
    console.log(
      `[${new Date().toISOString()}] Starting 2-stage AI analysis...`,
    );

    // === 1단계: 아키텍처 패턴 및 레이어 구조 정의 ===
    const firstStageUserPrompt = buildFirstStageUserPrompt(parsedData);
    const firstStageResponse = await callClovaAPI(
      STAGE1_SYSTEM_PROMPT,
      firstStageUserPrompt,
      'Stage 1: Architecture Definition',
    );

    const firstStageResult = extractJSON(firstStageResponse);
    if (!firstStageResult) {
      throw new Error('Failed to parse Stage 1 response');
    }

    console.log('Stage 1 Result:', JSON.stringify(firstStageResult, null, 2));

    // Rate limit 방지를 위한 딜레이 (15초)
    console.log(
      `[${new Date().toISOString()}] Waiting 15 seconds to avoid rate limit...`,
    );
    await delay(15000);

    // === 2단계: 파일/폴더를 레이어에 매핑 ===
    const secondStageUserPrompt = buildSecondStageUserPrompt(
      parsedData,
      firstStageResult,
    );
    const secondStageResponse = await callClovaAPI(
      STAGE2_SYSTEM_PROMPT,
      secondStageUserPrompt,
      'Stage 2: File Mapping',
    );

    const secondStageResult = extractJSON(secondStageResponse);
    if (!secondStageResult) {
      throw new Error('Failed to parse Stage 2 response');
    }

    console.log('Stage 2 Result:', JSON.stringify(secondStageResult, null, 2));

    // 두 단계 결과 통합
    const combinedResult = {
      stage1: firstStageResult,
      stage2: secondStageResult,
      boundaries: mergeStagedResults(firstStageResult, secondStageResult),
    };

    console.log(`[${new Date().toISOString()}] 2-stage AI analysis completed`);
    return combinedResult;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] AI analysis failed:`,
      error.message,
    );
    throw error;
  }
}

/**
 * 1단계와 2단계 결과를 통합
 * @param {Object} stage1 - 1단계 결과
 * @param {Object} stage2 - 2단계 결과
 * @returns {Object}
 */
function mergeStagedResults(stage1, stage2) {
  const merged = {};

  // stage1의 boundaries를 순회
  const boundaries = stage1.boundaries || {};

  for (const [boundaryName, boundaryData] of Object.entries(boundaries)) {
    merged[boundaryName] = {
      architecturePatterns: boundaryData.architecturePatterns || [],
      layers: [],
      dependencyFlow: boundaryData.dependencyFlow || '',
    };

    // stage1의 layers와 stage2의 파일 매핑을 결합
    const stage1Layers = boundaryData.layers || [];
    const stage2Boundary = stage2.boundaries?.[boundaryName];
    const stage2Layers = stage2Boundary?.layers || [];

    stage1Layers.forEach((stage1Layer) => {
      const stage2Layer = stage2Layers.find((l) => l.name === stage1Layer.name);

      merged[boundaryName].layers.push({
        name: stage1Layer.name,
        responsibility: stage1Layer.responsibility,
        characteristics: stage1Layer.characteristics,
        folders: stage2Layer?.folders || [],
        files: stage2Layer?.files || [],
      });
    });
  }

  return merged;
}

module.exports = {
  analyzeArchitecture,
};
