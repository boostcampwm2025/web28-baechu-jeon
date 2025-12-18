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
 * 최종 응답 포매팅 (2단계 분석 결과 처리)
 * @param {Object} aiResult - 2단계 AI 분석 결과
 * @param {Object} parsedData - 파싱된 ZIP 데이터
 * @returns {Object}
 */
function formatResponse(aiResult, parsedData) {
  const { tree, contents, fileCount, folderCount } = parsedData;

  // aiResult는 이미 통합된 결과 (stage1, stage2, boundaries 포함)
  const { stage1, stage2, boundaries } = aiResult;

  return {
    success: true,
    data: {
      projectInfo: {
        name: extractProjectName(contents),
        detectedFramework: detectFrameworks(tree, contents),
        fileCount: fileCount || countFiles(tree),
        folderCount: folderCount || countFolders(tree),
      },
      // 통합된 boundaries (레이어 정의 + 파일 매핑)
      boundaries: boundaries || {},
      // 추가 정보
      crossBoundaryInteraction: stage1?.crossBoundaryInteraction || '',
      assumptions: stage2?.assumptions || [],
      // 디버깅용 원본 데이터
      fileTree: tree,
      _debug: {
        stage1Result: stage1,
        stage2Result: stage2,
      },
    },
  };
}

module.exports = {
  formatResponse,
  extractProjectName,
  detectFrameworks,
  countFiles,
  countFolders
};
