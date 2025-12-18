/**
 * 추출 대상 파일 목록
 */
const TARGET_FILES = [
  // 문서
  'readme.md', 'readme', 'readme.txt',

  // 프론트엔드 설정
  'package.json', 'tsconfig.json', 'next.config.js', 'next.config.mjs', 'next.config.ts',
  'vite.config.js', 'vite.config.ts', 'webpack.config.js',
  'tailwind.config.js', 'tailwind.config.ts',

  // 백엔드 설정
  'docker-compose.yml', 'docker-compose.yaml', 'dockerfile',

  // 모노레포
  'turbo.json', 'pnpm-workspace.yaml', 'lerna.json', 'nx.json',

  // 기타
  '.gitignore', '.env.example', '.env.sample',
 'main.js', 'main.ts', 'main.jsx', 'main.tsx',
  'app.js', 'app.ts', 'app.jsx', 'app.tsx',
  'index.js', 'index.ts', 'index.jsx', 'index.tsx',
  'server.js', 'server.ts'
];

/**
 * 제외할 폴더 목록
 */
const EXCLUDE_FOLDERS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.turbo',
  'out',
  '.cache',
  'public',
  'static'
];

/**
 * 파일명이 타겟 파일인지 확인
 * @param {string} fileName - 파일 경로
 * @returns {boolean}
 */
function isTargetFile(fileName) {
  const baseName = fileName.split('/').pop().toLowerCase();
  return TARGET_FILES.some(target => baseName === target);
}

/**
 * 경로가 제외 대상인지 확인
 * @param {string} path - 파일/폴더 경로
 * @returns {boolean}
 */
function shouldExclude(path) {
  return EXCLUDE_FOLDERS.some(folder => path.includes(`${folder}/`) || path.includes(`\\${folder}\\`));
}

module.exports = {
  TARGET_FILES,
  EXCLUDE_FOLDERS,
  isTargetFile,
  shouldExclude
};
