import { Injectable } from '@nestjs/common';

@Injectable()
export class GitignoreMatcherService {
  private readonly DEFAULT_PATTERNS = [
    'node_modules',
    'dist',
    'build',
    '.next',
    '.git',
    'coverage',
    '.env',
    '.DS_Store',
    'out',
    '.turbo',
    '*.log',
    '.cache',
    '.gitignore',
    '.npmrc',
    '.prettierrc',
    '.eslintrc',
    '.vscode/',
  ];

  private readonly ALWAYS_INCLUDE = [
    'README.md',
    'LICENSE',
    'package.json',
    'tsconfig.json',
    'webpack.config.js',
    'vite.config.js',
    '__tests__',
    'test',
    'spec',
    'docs',
    '.env.sample',
  ];

  // 패턴 매칭을 위한 헬퍼 함수 (중복 로직 제거)
  private isMatch(pathParts: string[], pattern: string): boolean {
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$',
      );
      return pathParts.some((part) => regex.test(part));
    }
    return pathParts.includes(pattern.replace(/\/$/, ''));
  }

  // 이제 parseGitignore는 .gitignore 파일의 내용만 순수하게 파싱합니다.
  parseGitignore(content: string | null): string[] {
    if (!content) return [];
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && !line.startsWith('!'))
      .map((line) => line.replace(/^\/|\/$/g, ''));
  }

  shouldIgnore(path: string, gitignorePatterns: string[]): boolean {
    const pathParts = path.split('/');

    // [1순위] DEFAULT_PATTERNS (절대 무시)
    // 경로 어디에든 node_modules나 .git이 있으면 ALWAYS_INCLUDE 검사도 안 하고 바로 차단합니다.
    if (this.DEFAULT_PATTERNS.some((p) => this.isMatch(pathParts, p))) {
      return true;
    }

    // [2순위] ALWAYS_INCLUDE (화이트리스트)
    // 1순위를 통과한(즉, node_modules가 아닌 곳에 있는) 중요 파일은 무조건 살립니다.
    if (this.ALWAYS_INCLUDE.some((name) => pathParts.includes(name))) {
      return false;
    }

    // [3순위] 유저가 설정한 .gitignore 패턴
    if (gitignorePatterns.some((p) => this.isMatch(pathParts, p))) {
      return true;
    }

    return false;
  }
}
