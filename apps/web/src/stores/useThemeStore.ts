import { create } from "zustand";
import { getCookie, setCookie } from "@/utils/cookies";
import { DEFAULT_THEME, COOKIE_THEME_NAME } from "@/constants/theme";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
  setCookie(COOKIE_THEME_NAME, theme, 365);
}

export const useThemeStore = create<ThemeState>((set) => {
  const cookieTheme =
    typeof window !== "undefined" ? getCookie(COOKIE_THEME_NAME) : null;
  const initialTheme: Theme =
    cookieTheme === "dark" || cookieTheme === "light"
      ? cookieTheme
      : DEFAULT_THEME;
  return {
    theme: initialTheme,
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        return { theme: next };
      }),
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
  };
});
