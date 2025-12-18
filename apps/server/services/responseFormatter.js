/**
 * 프로젝트 이름 추출
 * @param {Object} contents - 파일 내용들
 * @returns {string}
 */
function extractProjectName(contents) {
  // package.json에서 프로젝트 이름 추출
  for (const [path, content] of Object.entries(contents)) {
    if (path.toLowerCase().includes('package.json')) {
      try {
        const pkg = JSON.parse(content);
        if (pkg.name) return pkg.name;
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    }
  }
  return 'Unknown Project';
}

/**
 * 프레임워크 감지
 * @param {Array} tree - 파일 트리
 * @param {Object} contents - 파일 내용들
 * @returns {Array<string>}
 */
function detectFrameworks(tree, contents) {
  const frameworks = new Set();

  // package.json에서 프레임워크 감지
  for (const [path, content] of Object.entries(contents)) {
    if (path.toLowerCase().includes('package.json')) {
      try {
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['next']) frameworks.add('Next.js');
        if (deps['react']) frameworks.add('React');
        if (deps['vue']) frameworks.add('Vue');
        if (deps['@angular/core']) frameworks.add('Angular');
        if (deps['express']) frameworks.add('Express');
        if (deps['nestjs']) frameworks.add('NestJS');
        if (deps['fastify']) frameworks.add('Fastify');
        if (deps['tailwindcss']) frameworks.add('Tailwind CSS');
        if (deps['typescript']) frameworks.add('TypeScript');
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    }
  }

  // turbo.json 확인
  if (contents['turbo.json']) {
    frameworks.add('Turborepo');
  }

  return Array.from(frameworks);
}

/**
 * 파일 개수 세기
 * @param {Array} tree - 파일 트리
 * @returns {number}
 */
function countFiles(tree) {
  let count = 0;
  tree.forEach(node => {
    if (node.type === 'file') {
      count++;
    } else if (node.children) {
      count += countFiles(node.children);
    }
  });
  return count;
}

/**
 * 폴더 개수 세기
 * @param {Array} tree - 파일 트리
 * @returns {number}
 */
function countFolders(tree) {
  let count = 0;
  tree.forEach(node => {
    if (node.type === 'folder') {
      count++;
      if (node.children) {
        count += countFolders(node.children);
      }
    }
  });
  return count;
}

/**
 * AI 응답에서 JSON 추출
 * @param {Object} aiResult - Clova API 응답
 * @returns {Object}
 */
function extractJSON(aiResult) {
  try {
    console.log('AI Result Structure:', JSON.stringify(aiResult, null, 2));

    // Clova API 응답 구조 확인 (여러 가지 가능성)
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

    console.log('Extracted content:', content.substring(0, 500) + '...');

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
    console.error('AI Result:', aiResult);
    return null;
  }
}

/**
 * 최종 응답 포매팅
 * @param {Object} aiResult - AI 분석 결과
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @param {string} prompt - AI에게 보낸 프롬프트
 * @returns {Object}
 */
function formatResponse(aiResult, parsedData, prompt = '') {
  const { tree, contents, fileCount, folderCount } = parsedData;

  // AI 응답 파싱
  const analyzed = extractJSON(aiResult);

  return {
    success: true,
    data: {
      projectInfo: {
        name: extractProjectName(contents),
        detectedFramework: detectFrameworks(tree, contents),
        fileCount: fileCount || countFiles(tree),
        folderCount: folderCount || countFolders(tree)
      },
      architecture: analyzed.architecture || {
        type: 'Unknown',
        patterns: [],
        description: 'Architecture analysis unavailable'
      },
      layers: analyzed.layers || [],
      visualization: analyzed.visualization || {
        nodes: [],
        edges: []
      },
      fileTree: tree,
      prompt: prompt // AI에게 보낸 프롬프트 추가
    }
  };
}

module.exports = {
  formatResponse,
  extractProjectName,
  detectFrameworks,
  countFiles,
  countFolders
};
