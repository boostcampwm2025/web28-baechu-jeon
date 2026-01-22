export function parseAiJson<T = any>(content: string): T {
  let cleaned = content.trim();

  // ```json ... ``` 제거
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
  }
  // ``` ... ``` 제거
  else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
  }

  try {
    return JSON.parse(cleaned.trim()) as T;
  } catch (e) {
    throw new Error(`AI JSON 파싱 실패:\n${cleaned.substring(0, 300)}`);
  }
}
