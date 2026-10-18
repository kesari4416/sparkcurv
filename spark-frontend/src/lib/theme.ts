/**
 * Two attributes on <html>, both set before first paint by `themeBootScript`:
 *
 *  - data-theme="ink" | "legacy": which design system the page uses. Page-level styles
 *    (background, hidden scrollbar) key off it. It replaces `html:has(.theme-ink)`: a
 *    :has() on the root makes the browser re-check the whole document's style on DOM
 *    changes, which the animated pages make constantly. Client-side navigation is then
 *    handled by components/ThemeMarker.
 *  - data-scheme="light" (absent = dark): the visitor's light/dark choice on the ink
 *    design, saved by components/ThemeToggle. Dark is the default.
 */
export type Theme = 'ink' | 'legacy';
export type Scheme = 'dark' | 'light';

/** Path prefixes still on the original light design (the admin tool). Everything else is ink. */
export const LEGACY_PREFIXES = ['/admin'];

/** localStorage key for the visitor's light/dark choice. */
export const SCHEME_KEY = 'sc-scheme';

/**
 * Inline script for the root layout's <head>. It runs while the HTML is still parsing,
 * so there is no flash of the wrong background or scheme.
 */
export const themeBootScript = `(function(){var d=document.documentElement,p=location.pathname;d.dataset.theme=${JSON.stringify(LEGACY_PREFIXES)}.some(function(x){return p===x||p.indexOf(x+"/")===0})?"legacy":"ink";try{if(localStorage.getItem(${JSON.stringify(SCHEME_KEY)})==="light")d.dataset.scheme="light"}catch(e){}})()`;
