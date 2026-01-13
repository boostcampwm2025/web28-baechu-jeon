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
  ];

  parseGitignore(content: string | null): string[] {
    const uploadPatterns = content
      ? content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .map((line) => line.replace(/^\//, ''))
      : [];

    const combinedPatterns = [...this.DEFAULT_PATTERNS, ...uploadPatterns];
    return Array.from(new Set(combinedPatterns));
  }

  shouldIgnore(path: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const regex = new RegExp(
          '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
        );
        if (regex.test(path)) return true;
      }

      const pathParts = path.split('/');
      if (pathParts.includes(pattern)) return true;

      if (path.startsWith(pattern + '/')) return true;
      if (path === pattern) return true;
    }

    return false;
  }
}
