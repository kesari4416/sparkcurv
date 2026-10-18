/**
 * Page theme marker: <html data-theme="ink" | "legacy">.
 *
 * Page-level styles (background, color-scheme, hidden scrollbar) key off this attribute.
 * It replaces `html:has(.theme-ink)`: a :has() on the root element makes the browser
 * re-check the whole document's style on DOM changes, which the animated pages make
 * constantly.
 */
export type Theme = 'ink' | 'legacy';

/** Path prefixes still on the original light design (the admin tool). Everything else is ink. */
export const LEGACY_PREFIXES = ['/admin'];

/**
 * Inline script for the root layout's <head>: sets the attribute while the HTML is still
 * parsing, so there is no flash of the wrong background. Client-side navigation is then
 * handled by components/ThemeMarker.
 */
export const themeBootScript = `document.documentElement.dataset.theme=${JSON.stringify(LEGACY_PREFIXES)}.some(function(p){return location.pathname===p||location.pathname.indexOf(p+"/")===0})?"legacy":"ink"`;
