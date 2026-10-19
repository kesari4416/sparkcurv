'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, Link2, Quote, List, ListOrdered,
  Code, SquareCode, Table, Minus, ImagePlus, Images, PenLine, Columns2, Eye, CircleHelp, X,
} from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { sanitizeHtml } from '../lib/sanitize';
import { IMAGE_TYPES, imageFileError, uploadImage } from '../lib/images';

/*
 * Markdown editor for blog posts: a plain textarea (so pasting, spell check, undo and
 * selection all behave natively), a toolbar that inserts Markdown, and a preview rendered
 * by the server with the same renderer and sanitiser as published posts.
 */

// ── Preview ─────────────────────────────────────────────────────────────────────

/**
 * Server-rendered HTML for `markdown`, refreshed `delay` ms after the last change.
 * Returns { html, loading, error }.
 */
export function useMarkdownPreview(markdown, { enabled = true, delay = 350 } = {}) {
  const [state, setState] = useState({ html: '', loading: false, error: '', source: null });

  useEffect(() => {
    if (!enabled || markdown === state.source) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, loading: true }));
      api
        .post('/blogs/preview', { markdown }, { signal: controller.signal })
        .then(({ data }) => setState({ html: data.html, loading: false, error: '', source: markdown }))
        .catch((err) => {
          if (controller.signal.aborted) return;
          setState((s) => ({ ...s, loading: false, error: errorMessage(err, 'Preview unavailable.') }));
        });
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [markdown, enabled, delay, state.source]);

  return state;
}

/** Typography for rendered posts in the admin (light) panel. */
export const PREVIEW_PROSE =
  'prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#02028B] ' +
  'prose-img:rounded-lg prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-code:before:content-none prose-code:after:content-none ' +
  'prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 ' +
  'prose-th:border prose-th:border-slate-200 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2';

// ── Text editing ────────────────────────────────────────────────────────────────

/**
 * Replaces the textarea's selection with `text`, then selects [from, to] (offsets inside
 * `text`). insertText keeps the browser's undo history; setRangeText is the fallback.
 */
function insert(ta, text, from = text.length, to = from) {
  const start = ta.selectionStart;
  ta.focus();
  let ok = false;
  try {
    ok = document.execCommand('insertText', false, text);
  } catch {
    ok = false;
  }
  if (!ok) {
    ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  ta.setSelectionRange(start + from, start + to);
}

/** Expands the selection to whole lines and returns [start, end, text]. */
function selectLines(ta) {
  const v = ta.value;
  const start = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let end = v.indexOf('\n', ta.selectionEnd === ta.selectionStart ? ta.selectionEnd : ta.selectionEnd - 1);
  if (end === -1) end = v.length;
  ta.setSelectionRange(start, end);
  return [start, end, v.slice(start, end)];
}

/** Wraps the selection in `before`/`after`, or unwraps it when already wrapped. */
function wrap(ta, before, after, placeholder) {
  const v = ta.value;
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const sel = v.slice(s, e);
  if (v.slice(s - before.length, s) === before && v.slice(e, e + after.length) === after) {
    ta.setSelectionRange(s - before.length, e + after.length);
    insert(ta, sel, 0, sel.length);
    return;
  }
  const inner = sel || placeholder;
  insert(ta, before + inner + after, before.length, before.length + inner.length);
}

const LIST_LINE = /^(\s*)([-*+]|\d+[.)])\s+/;

/** Toggles a line prefix on every selected line. `make(i)` returns the prefix for line i. */
function prefixLines(ta, make, strip) {
  const [, , text] = selectLines(ta);
  const lines = text.split('\n');
  const all = lines.every((l) => strip.test(l));
  const out = lines.map((l, i) => (all ? l.replace(strip, '') : make(i) + l.replace(strip, ''))).join('\n');
  insert(ta, out, 0, out.length);
}

/** Puts `block` on its own lines, with a blank line around it. */
function insertBlock(ta, block, selectFrom, selectTo) {
  const v = ta.value;
  const s = ta.selectionStart;
  const before = v.slice(0, s);
  const lead = before === '' || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const after = v.slice(ta.selectionEnd);
  const trail = after.startsWith('\n\n') || after === '' ? '' : after.startsWith('\n') ? '\n' : '\n\n';
  const text = lead + block + trail;
  insert(ta, text, lead.length + (selectFrom ?? block.length), lead.length + (selectTo ?? selectFrom ?? block.length));
}

const heading = (level) => (ta) => {
  const marks = `${'#'.repeat(level)} `;
  const [, , text] = selectLines(ta);
  const stripped = text.replace(/^#{1,6}\s+/, '');
  const out = text.startsWith(marks) ? stripped : marks + stripped;
  insert(ta, out, 0, out.length);
};

const link = (ta) => {
  const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
  if (/^(https?:\/\/|\/|mailto:)\S*$/.test(sel)) insert(ta, `[](${sel})`, 1, 1);
  else {
    const text = sel || 'link text';
    insert(ta, `[${text}](https://)`, text.length + 3, text.length + 11);
  }
};

const TABLE = '| Column | Column |\n|:--|:--|\n| Cell | Cell |';

const TOOLS = [
  { label: 'Heading', key: '', Icon: Heading2, run: heading(2) },
  { label: 'Subheading', key: '', Icon: Heading3, run: heading(3) },
  null,
  { label: 'Bold', key: 'Ctrl+B', Icon: Bold, run: (ta) => wrap(ta, '**', '**', 'bold text') },
  { label: 'Italic', key: 'Ctrl+I', Icon: Italic, run: (ta) => wrap(ta, '*', '*', 'italic text') },
  { label: 'Strikethrough', key: '', Icon: Strikethrough, run: (ta) => wrap(ta, '~~', '~~', 'text') },
  { label: 'Link', key: 'Ctrl+K', Icon: Link2, run: link },
  null,
  { label: 'Bulleted list', key: '', Icon: List, run: (ta) => prefixLines(ta, () => '- ', LIST_LINE) },
  { label: 'Numbered list', key: '', Icon: ListOrdered, run: (ta) => prefixLines(ta, (i) => `${i + 1}. `, LIST_LINE) },
  { label: 'Quote', key: '', Icon: Quote, run: (ta) => prefixLines(ta, () => '> ', /^>\s?/) },
  null,
  { label: 'Inline code', key: '', Icon: Code, run: (ta) => wrap(ta, '`', '`', 'code') },
  {
    label: 'Code block',
    key: '',
    Icon: SquareCode,
    run: (ta) => {
      const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd) || 'code';
      insertBlock(ta, `\`\`\`\n${sel}\n\`\`\``, 4, 4 + sel.length);
    },
  },
  { label: 'Table', key: '', Icon: Table, run: (ta) => insertBlock(ta, TABLE, 2, 8) },
  { label: 'Divider', key: '', Icon: Minus, run: (ta) => insertBlock(ta, '---') },
];

const byLabel = (label) => TOOLS.find((t) => t?.label === label);
const SHORTCUTS = { b: byLabel('Bold'), i: byLabel('Italic'), k: byLabel('Link') };

const CHEATSHEET = [
  ['## Heading', 'Section heading (### for a smaller one)'],
  ['**bold**  *italic*  ~~struck~~', 'Emphasis'],
  ['[text](https://…)', 'Link'],
  ['![alt text](url)', 'Image'],
  ['- item  or  1. item', 'Lists (Enter continues them)'],
  ['> quote', 'Quote'],
  ['`code`  and  ```', 'Inline code and code blocks'],
  ['| a | b |  then  |--|--|', 'Table'],
  ['---', 'Divider'],
];

const MODES = [
  { id: 'write', label: 'Write', Icon: PenLine },
  { id: 'split', label: 'Split', Icon: Columns2 },
  { id: 'preview', label: 'Preview', Icon: Eye },
];

const countWords = (text) => (text.match(/[A-Za-z0-9À-ɏ]+(?:['’][A-Za-z]+)?/g) || []).length;

// ── Component ───────────────────────────────────────────────────────────────────

const MarkdownEditor = ({ value, onChange, onOpenGallery, className = '', notice }) => {
  const taRef = useRef(null);
  const previewRef = useRef(null);
  const fileRef = useRef(null);
  const uploadSeq = useRef(0); // unique placeholder per upload
  // Split view by default where there's room for it. The editor only mounts in the
  // browser (the admin panel renders after the session check), so window is available.
  const [mode, setMode] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches ? 'split' : 'write',
  );
  const [uploads, setUploads] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const previewing = mode !== 'write';
  const preview = useMarkdownPreview(value, { enabled: previewing });

  const run = (tool) => {
    const ta = taRef.current;
    if (!ta) return;
    if (mode === 'preview') setMode('split');
    tool.run(ta);
  };

  // Uploads images and inserts them where the cursor was. A placeholder is inserted first
  // and swapped for the real Markdown once the upload finishes.
  const uploadFiles = useCallback(
    async (files) => {
      const ta = taRef.current;
      const images = files.filter((f) => IMAGE_TYPES.includes(f.type));
      if (!ta || !images.length) return;
      for (const file of images) {
        const invalid = imageFileError(file);
        if (invalid) {
          setUploadError(`${file.name}: ${invalid}`);
          continue;
        }
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[[\]]/g, '');
        uploadSeq.current += 1;
        const token = `![Uploading ${alt}…](#upload-${uploadSeq.current})`;
        insertBlock(ta, token);
        setUploads((n) => n + 1);
        try {
          const url = await uploadImage(file);
          onChange(taRef.current.value.replace(token, `![${alt}](${url})`));
        } catch (err) {
          onChange(taRef.current.value.replace(token, ''));
          setUploadError(errorMessage(err, `${file.name}: upload failed.`));
        } finally {
          setUploads((n) => n - 1);
        }
      }
    },
    [onChange],
  );

  const onKeyDown = (e) => {
    const ta = e.currentTarget;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.shiftKey && !e.altKey) {
      const tool = SHORTCUTS[e.key.toLowerCase()];
      if (tool) {
        e.preventDefault();
        tool.run(ta);
        return;
      }
    }
    // Enter continues a list or quote; Enter on an empty item ends it.
    if (e.key === 'Enter' && !e.shiftKey && !mod && !e.nativeEvent.isComposing && ta.selectionStart === ta.selectionEnd) {
      const v = ta.value;
      const lineStart = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
      const line = v.slice(lineStart, ta.selectionStart);
      const m = line.match(/^(\s*)([-*+]|\d+[.)]|>)(\s+)(.*)$/);
      if (!m) return;
      e.preventDefault();
      const [, indent, marker, space, rest] = m;
      if (!rest.trim()) {
        // Swap the empty marker for a line break: the list ends with a blank line after it.
        ta.setSelectionRange(lineStart, ta.selectionStart);
        insert(ta, '\n');
        return;
      }
      const num = marker.match(/^(\d+)([.)])$/);
      const next = num ? `${Number(num[1]) + 1}${num[2]}` : marker;
      insert(ta, `\n${indent}${next}${space}`);
    }
  };

  const onPaste = (e) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.some((f) => IMAGE_TYPES.includes(f.type))) {
      e.preventDefault();
      uploadFiles(files);
    }
  };

  const onDrop = (e) => {
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.some((f) => IMAGE_TYPES.includes(f.type))) {
      e.preventDefault();
      uploadFiles(files);
    }
  };

  // Split view: keep the preview roughly level with the text being written.
  const onScroll = (e) => {
    const ta = e.currentTarget;
    const pv = previewRef.current;
    if (mode !== 'split' || !pv) return;
    const ratio = ta.scrollTop / Math.max(1, ta.scrollHeight - ta.clientHeight);
    pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight);
  };

  const words = countWords(value);

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-[#02028B] focus-within:ring-2 focus-within:ring-[#02028B]/20 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
          {TOOLS.map((tool, i) =>
            tool ? (
              <button
                key={tool.label}
                type="button"
                title={tool.key ? `${tool.label} (${tool.key})` : tool.label}
                aria-label={tool.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(tool)}
                className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-200/70 hover:text-gray-900"
              >
                <tool.Icon className="h-4 w-4" />
              </button>
            ) : (
              <span key={`d${i}`} aria-hidden className="mx-1 h-4 w-px bg-gray-300" />
            ),
          )}
          <span aria-hidden className="mx-1 h-4 w-px bg-gray-300" />
          <button
            type="button"
            title="Upload image (or paste / drop one into the text)"
            aria-label="Upload image"
            onClick={() => fileRef.current?.click()}
            className="rounded-md p-1.5 text-[#02028B] transition-colors hover:bg-gray-200/70"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          {onOpenGallery && (
            <button
              type="button"
              title="Insert from gallery"
              aria-label="Insert image from gallery"
              onClick={() => {
                const ta = taRef.current;
                const at = ta ? [ta.selectionStart, ta.selectionEnd] : null;
                onOpenGallery((url) => {
                  const el = taRef.current;
                  if (!el) return;
                  if (at) el.setSelectionRange(at[0], at[1]);
                  insertBlock(el, `![Image description](${url})`, 2, 19);
                });
              }}
              className="rounded-md p-1.5 text-[#02028B] transition-colors hover:bg-gray-200/70"
            >
              <Images className="h-4 w-4" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={IMAGE_TYPES.join(',')}
            multiple
            className="hidden"
            data-testid="md-image-file-input"
            onChange={(e) => {
              uploadFiles(Array.from(e.target.files || []));
              e.target.value = '';
            }}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            aria-expanded={showHelp}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${showHelp ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <CircleHelp className="h-3.5 w-3.5" />
            Markdown
          </button>
          <div role="tablist" aria-label="Editor view" className="flex rounded-lg bg-gray-200/70 p-0.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                data-testid={`md-mode-${m.id}`}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  mode === m.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                } ${m.id === 'split' ? 'hidden lg:flex' : ''}`}
              >
                <m.Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <dl className="grid flex-1 gap-x-8 gap-y-1.5 text-xs sm:grid-cols-2">
              {CHEATSHEET.map(([syntax, meaning]) => (
                <div key={syntax} className="flex items-baseline gap-3">
                  <dt className="w-44 shrink-0 font-mono text-gray-800">{syntax}</dt>
                  <dd className="text-gray-500">{meaning}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => setShowHelp(false)} aria-label="Close Markdown help" className="text-gray-400 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Paste or drop images straight into the text to upload them.</p>
        </div>
      )}

      {notice && <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">{notice}</div>}

      {uploadError && (
        <div role="alert" className="flex items-center justify-between gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="text-red-500 hover:text-red-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Panes */}
      <div className={`grid min-h-0 flex-1 ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onDrop={onDrop}
          onScroll={onScroll}
          spellCheck
          data-testid="markdown-editor"
          aria-label="Post content (Markdown)"
          placeholder={'Write your post in Markdown…\n\n## A section heading\n\nA paragraph with **bold** text and a [link](https://sparkcurv.com).'}
          className={`h-full min-h-[24rem] w-full resize-none bg-white px-5 py-4 font-mono text-[0.9rem] leading-7 text-gray-800 outline-none placeholder:text-gray-400 ${
            mode === 'preview' ? 'hidden' : ''
          } ${mode === 'split' ? 'lg:border-r lg:border-gray-200' : ''}`}
        />
        {previewing && (
          <div ref={previewRef} className={`relative min-h-[24rem] overflow-y-auto bg-white px-6 py-5 ${mode === 'split' ? 'hidden lg:block' : ''}`}>
            {preview.loading && <span className="absolute right-4 top-3 text-[11px] text-gray-400">Updating…</span>}
            {preview.error ? (
              <p className="text-sm text-red-600">{preview.error}</p>
            ) : value.trim() ? (
              <div data-testid="markdown-preview" className={PREVIEW_PROSE} dangerouslySetInnerHTML={{ __html: sanitizeHtml(preview.html) }} />
            ) : (
              <p className="text-sm italic text-gray-400">The preview appears here as you write.</p>
            )}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-4 py-1.5 text-[11px] text-gray-500">
        <span>
          {words.toLocaleString()} {words === 1 ? 'word' : 'words'} · {Math.max(1, Math.round(words / 200))} min read
        </span>
        <span aria-live="polite">{uploads > 0 ? `Uploading ${uploads} image${uploads > 1 ? 's' : ''}…` : 'Markdown'}</span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
