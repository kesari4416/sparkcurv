import DOMPurify from 'dompurify';

// Blog HTML is written by admins in RichTextEditor. The backend sanitizes it too
// (nh3 in server.py); this is the second layer for anything rendered as HTML.
// "/path" is allowed, but not "//host" or "/\host" (browsers treat both as another site).
const ALLOWED_URI = /^(?:https?:|mailto:|tel:|\/(?![/\\])|#)/i;

// DOMPurify needs a DOM. During server rendering it is a stub without addHook/sanitize,
// so the hook is only registered in the browser.
if (DOMPurify.isSupported) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer nofollow');
      if (node.getAttribute('target') !== '_self') node.setAttribute('target', '_blank');
    }
  });
}

/** Sanitised HTML in the browser; an empty string on the server, where there is no DOM to clean with. */
export const sanitizeHtml = (html) =>
  DOMPurify.isSupported
    ? DOMPurify.sanitize(html || '', {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['srcset'],
        ALLOWED_URI_REGEXP: ALLOWED_URI,
      })
    : '';
