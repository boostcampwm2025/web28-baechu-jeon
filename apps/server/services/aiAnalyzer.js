const axios = require('axios');
const clovaConfig = require('../config/clova');

/**
 * 1단계: 아키텍처 패턴 및 레이어 구조 정의 프롬프트
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @returns {string}
 */
function buildFirstStagePrompt(parsedData) {
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

  // 주요 설정 파일 내용
  const contentsText = Object.entries(contents)
    .map(([path, content]) => {
      return `### ${path}\n\`\`\`\n${content}\n\`\`\``;
    })
    .join('\n\n');

  return `
You are an expert software architect.
You are given:
- Complete folder structure
- File names and paths
- Configuration files

⚠️ This is STAGE 1: Architecture Pattern & Layer Structure Definition
⚠️ Do NOT map files to layers yet. Focus ONLY on defining the architecture.
⚠️ **IMPORTANT: Respond in Korean (한글)**

---
# Project Structure
${treeText}

# Configuration Files
${contentsText}

---
## STAGE 1 Instructions: Define Architecture & Layers

### Step 1. Identify Project Boundaries
1. Identify all logical runtime boundaries (frontend, backend, shared, etc.)
2. Each boundary represents a separate deployable or logical unit
3. List all boundaries that exist in this project

### Step 2. Determine Architecture Patterns (Per Boundary)
For EACH boundary:
1. Identify the PRIMARY architectural pattern(s)
2. Provide concrete evidence from folder structure and file naming
3. Justify why this pattern fits the project structure

Common patterns: MVC, Layered, Clean Architecture, Feature-based, Domain-driven, etc.

### Step 3. Define Layer Structure (Per Boundary)
For EACH boundary:
1. Define AT LEAST 3 layers
2. Each layer MUST have:
   - **name**: Clear layer name
   - **responsibility**: What this layer is responsible for
   - **characteristics**: How to identify if a file/folder belongs to this layer
3. Layers should represent RESPONSIBILITIES, not just folder names

Example layer characteristics:
- "Contains React components that render UI"
- "Handles business logic and use cases"
- "Manages data fetching and API calls"
- "Defines data models and types"

### Step 4. Define Dependency Flow
For EACH boundary:
- Describe the intended dependency direction between layers
- Which layers can depend on which layers

### Step 5. Cross-Boundary Relationships
If multiple boundaries exist:
- Explain how they interact
- Describe the role of shared code

---
## Output Format (STRICT JSON ONLY)

Respond with VALID JSON ONLY. No markdown. No explanations outside JSON.
**All text values inside JSON must be in Korean (한글).**

{
  "boundaries": {
    "frontend": {
      "architecturePatterns": [
        {
          "name": "패턴 이름 (Korean)",
          "evidence": ["증거 1 (Korean)", "증거 2"]
        }
      ],
      "layers": [
        {
          "name": "레이어 이름 (Korean)",
          "responsibility": "이 레이어가 하는 일 (Korean)",
          "characteristics": ["파일 식별 방법 (Korean)"]
        }
      ],
      "dependencyFlow": "의존성 설명 (Korean)"
    },
    "backend": { ... },
    ...
  },
  "crossBoundaryInteraction": "경계 간 상호작용 (Korean)"
}

⚠️ Do NOT include file/folder mappings in this stage.
`;
}

/**
 * 2단계: 파일/폴더를 레이어에 매핑하는 프롬프트
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @param {Object} firstStageResult - 1단계 분석 결과
 * @returns {string}
 */
function buildSecondStagePrompt(parsedData, firstStageResult) {
  const { tree } = parsedData;

  // 파일 트리를 텍스트로 변환 (경로 포함)
  function treeToText(nodes, depth = 0, parentPath = '') {
    return nodes
      .map((node) => {
        const indent = '  '.repeat(depth);
        const icon = node.type === 'folder' ? '📁' : '📄';
        const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
        let text = `${indent}${icon} ${node.name} (${currentPath})`;
        if (node.children && node.children.length > 0) {
          text += '\n' + treeToText(node.children, depth + 1, currentPath);
        }
        return text;
      })
      .join('\n');
  }

  const treeText = treeToText(tree);

  return `
You are an expert software architect.

⚠️ This is STAGE 2: Map ALL Files and Folders to Defined Layers
⚠️ **IMPORTANT: Respond in Korean (한글)**

You previously defined the following architecture:
${JSON.stringify(firstStageResult, null, 2)}

---
# Complete Project Structure (with paths)
${treeText}

---
## STAGE 2 Instructions: Map Files to Layers

### Your Task
For EACH boundary defined in Stage 1:
1. Go through EVERY folder and file in the project structure
2. Assign each folder/file to the appropriate layer based on:
   - The layer characteristics defined in Stage 1
   - The file/folder path and naming
   - The folder hierarchy

### Mapping Rules
1. **Every file and folder MUST be assigned to exactly ONE layer**
2. Use the "characteristics" from Stage 1 to determine which layer each file belongs to
3. If a file is ambiguous, use your best judgment and note it in "assumptions"
4. For folders: assign based on the PRIMARY purpose of files within
5. **Do NOT skip files** - include configuration files, entry points, everything

### Output Format (STRICT JSON ONLY)

Respond with VALID JSON ONLY. No markdown.
**All text values in "assumptions" must be in Korean (한글).**

{
  "boundaries": {
    "frontend": {
      "layers": [
        {
          "name": "layer name (must match Stage 1)",
          "folders": ["folder/path1", "folder/path2"],
          "files": ["file/path1.js", "file/path2.tsx"]
        }
      ]
    },
    "backend": { ... },
    ...
  },
  "assumptions": [
    "애매한 매핑 설명 (Korean)"
  ]
}

⚠️ All paths must be exact paths from the project structure above.
⚠️ Every file/folder from the tree must appear in exactly one layer.
`;
}

/**
 * Clova Studio API 단일 호출 헬퍼
 * @param {string} prompt - 프롬프트
 * @param {string} stageName - 단계 이름 (로깅용)
 * @returns {Promise<Object>}
 */
async function callClovaAPI(prompt, stageName) {
  try {
    console.log(`[${new Date().toISOString()}] Starting ${stageName}...`);

    const response = await axios.post(
      clovaConfig.apiUrl,
      {
        messages: [
          {
            role: 'system',
            content:
              '당신은 전문 소프트웨어 아키텍트입니다. 프로젝트 구조를 분석하고 아키텍처 패턴에 대한 통찰을 제공합니다. 항상 유효한 JSON 형식으로만 응답하세요. 모든 응답은 한글로 작성하세요.',
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
  try {
    // Clova API 응답 구조 확인
    let content = '';

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
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 2단계 AI 분석 수행
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @returns {Promise<Object>}
 */
async function analyzeArchitecture(parsedData) {
  try {
    console.log(`[${new Date().toISOString()}] Starting 2-stage AI analysis...`);

    // === 1단계: 아키텍처 패턴 및 레이어 구조 정의 ===
    const firstStagePrompt = buildFirstStagePrompt(parsedData);
    const firstStageResponse = await callClovaAPI(firstStagePrompt, 'Stage 1: Architecture Definition');

    const firstStageResult = extractJSON(firstStageResponse);
    if (!firstStageResult) {
      throw new Error('Failed to parse Stage 1 response');
    }

    console.log('Stage 1 Result:', JSON.stringify(firstStageResult, null, 2));

    // Rate limit 방지를 위한 딜레이 (10초)
    console.log(`[${new Date().toISOString()}] Waiting 10 seconds to avoid rate limit...`);
    await delay(10000);

    // === 2단계: 파일/폴더를 레이어에 매핑 ===
    const secondStagePrompt = buildSecondStagePrompt(parsedData, firstStageResult);
    const secondStageResponse = await callClovaAPI(secondStagePrompt, 'Stage 2: File Mapping');

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

    stage1Layers.forEach(stage1Layer => {
      const stage2Layer = stage2Layers.find(l => l.name === stage1Layer.name);

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
  buildFirstStagePrompt,
  buildSecondStagePrompt,
};
