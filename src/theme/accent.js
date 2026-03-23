/**
 * Canvas / WebGL should use this instead of hardcoded hex.
 * Change the site orange only in `src/styles/theme.css` (`--accent`).
 * Fallback hex below must match that variable if styles fail to load.
 */
export function accentFillStyle() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();
  if (!v) {
    console.warn(
      '[theme/accent] --accent missing (load theme.css first). Using fallback.',
    );
  }
  return v || '#ff9f00';
}
