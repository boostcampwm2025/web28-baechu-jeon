import { Injectable, BadRequestException } from '@nestjs/common';

export interface GithubArchiveUrlResult {
  archiveUrl: string;
  owner: string;
  repo: string;
  branch: string;
}

@Injectable()
export class GithubArchiveService {
  /**
   * GitHub 저장소 URL을 검증하고 ZIP 아카이브 다운로드 URL로 변환합니다.
   * - 허용: https://github.com/owner/repo, https://github.com/owner/repo/tree/branch
   * - 브랜치 미지정 시: HEAD(저장소 디폴트 브랜치) 사용
   */
  getArchiveUrl(githubUrl: string): GithubArchiveUrlResult {
    let parsed: URL;
    try {
      parsed = new URL(githubUrl.trim());
    } catch {
      throw new BadRequestException('올바른 URL 형식이 아닙니다.');
    }

    if (parsed.hostname !== 'github.com') {
      throw new BadRequestException(
        'GitHub 저장소 URL만 사용할 수 있습니다. (https://github.com/owner/repo)',
      );
    }

    const pathSegments = parsed.pathname
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean);

    if (pathSegments.length < 2) {
      throw new BadRequestException(
        '저장소 URL 형식이 올바르지 않습니다. (예: https://github.com/owner/repo)',
      );
    }

    const [owner, repoRaw, type, branch] = pathSegments;

    // .git 접미사 제거
    const repo = repoRaw?.endsWith('.git') ? repoRaw.slice(0, -4) : repoRaw;

    let ref = 'HEAD'; // 브랜치 미지정 시 저장소 디폴트 브랜치
    if (type === 'tree' && branch) {
      ref = branch;
    }

    const archiveUrl =
      ref === 'HEAD'
        ? `https://github.com/${owner}/${repo}/archive/HEAD.zip`
        : `https://github.com/${owner}/${repo}/archive/${ref}.zip`;
    return { archiveUrl, owner, repo, branch: ref };
  }
}
