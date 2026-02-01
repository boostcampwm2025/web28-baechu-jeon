export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function setCookie(name: string, value: string, days = 365, path = "/") {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=${path};SameSite=Lax`;
}

export function deleteCookie(name: string, path = "/") {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}
