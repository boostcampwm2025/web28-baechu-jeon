export function maybeDecode(value?: string | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  try {
    const decoded = decodeURIComponent(value);
    return decoded;
  } catch {
    return value as string;
  }
}
