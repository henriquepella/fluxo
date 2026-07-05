export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'fluxo-theme';
const CHANGE_EVENT = 'fluxo-theme-change';

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function toggleTheme(): void {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', next === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode — theme just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeTheme(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Runs before hydration to avoid a flash of the wrong theme. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`;
