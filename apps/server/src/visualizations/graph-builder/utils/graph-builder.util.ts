export function normalize(path: string, maxDepth: number): string {
  const parts = path.split('/').filter(Boolean);
  return parts.slice(0, maxDepth).join('/');
}

export function inferPathType(
  rawPath: string,
  normalizedPath: string,
  maxDepth: number,
): 'FILE' | 'FOLDER' {
  const rawParts = rawPath.split('/').filter(Boolean);
  const normalizedParts = normalizedPath.split('/').filter(Boolean);

  if (rawPath.trim().endsWith('/')) return 'FOLDER';

  // If normalization truncated the path, treat it as a folder node.
  if (rawParts.length > maxDepth || normalizedParts.length < rawParts.length) {
    return 'FOLDER';
  }

  const lastSegment = rawParts[rawParts.length - 1] ?? '';
  return lastSegment.includes('.') ? 'FILE' : 'FOLDER';
}

export function getLastSegment(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

export function getParentPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('/');
}
