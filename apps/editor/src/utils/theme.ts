/**
 * PURPOSE: The dark/light theme for every page, not just the editor.
 *
 * The theme is the `light-theme` class on `<html>` (tokens.css swaps its variables on it) plus an
 * optional saved choice in localStorage. With no saved choice it follows the OS setting, live.
 * Nothing else holds theme state: the editor's toggle and the nav gizmo (which watches the class)
 * both read the class, so there is no React state to drift from it.
 */

type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "libre3d-theme";
const LIGHT_THEME_CLASS = "light-theme";

const readSavedTheme = (): Theme | null => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
};

const systemPrefersDark = (): MediaQueryList => window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle(LIGHT_THEME_CLASS, theme === "light");
};

/** Applies the saved (or OS) theme. Call once, before the first render, so no page flashes dark. */
export const initTheme = (): void => {
  applyTheme(readSavedTheme() ?? (systemPrefersDark().matches ? "dark" : "light"));

  // Follow OS changes until the user picks a theme themselves.
  systemPrefersDark().addEventListener("change", (event) => {
    if (!readSavedTheme()) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
};

/** Flips the theme and remembers the choice, which stops it following the OS. */
export const toggleTheme = (): void => {
  const next: Theme = document.documentElement.classList.contains(LIGHT_THEME_CLASS) ? "dark" : "light";
  applyTheme(next);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Non-fatal: the choice just won't survive a reload.
  }
};
