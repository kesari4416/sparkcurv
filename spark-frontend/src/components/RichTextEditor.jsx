'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Heading3, Link, AlignLeft, AlignCenter,
  Quote, ImagePlus, Images, Type, Palette
} from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { sanitizeHtml } from '../lib/sanitize';

// Must match the backend's upload checks (magic bytes: jpeg/png/gif/webp, max 5 MB).
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Returns an error message, or '' when the file can be uploaded.
export const imageFileError = (file) => {
  if (!IMAGE_TYPES.includes(file?.type)) return 'Only JPEG, PNG, GIF or WebP images are allowed.';
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be under 5 MB.';
  return '';
};

// Uploads an image and resolves to its relative "/api/images/<id>" url.
export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/upload/image', fd);
  return data.url;
};

// Site-relative ("/path", but not "//host" or "/\host") or http(s)/mailto/tel only.
const isSafeLink = (url) => {
  if (/^\/(?![/\\])/.test(url)) return true;
  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

const escapeHtml = (text) => text
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const FONT_SIZES = [
  { label: 'Small', value: '1' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '4' },
  { label: 'X-Large', value: '5' },
  { label: 'Huge', value: '6' },
];

const COLOR_PALETTE = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  '#02028B', '#7C3AED', '#D97706', '#DC2626',
];

const ToolbarButton = ({ onClick, title, children }) => (
  <button type="button" title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className="p-1.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
    {children}
  </button>
);

const Divider = () => <div className="w-px h-4 bg-gray-300 mx-1 flex-shrink-0" />;

const RichTextEditor = ({ value, onChange, placeholder, onOpenGallery }) => {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const savedRangeRef = useRef(null);
  const colorBtnRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColor, setActiveColor] = useState('#000000');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Close color picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (colorBtnRef.current && !colorBtnRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Last html synced into / emitted from the editor. Only real edits are reported, so the
  // browser re-serializing loaded content (e.g. on blur) doesn't mark the post as changed.
  const lastHtmlRef = useRef('');

  const handleChange = useCallback(() => {
    const html = editorRef.current?.innerHTML;
    if (html === undefined || html === lastHtmlRef.current) return;
    lastHtmlRef.current = html;
    onChange(html);
  }, [onChange]);

  const exec = (command, val = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleChange();
  };

  const insertHeading = (level) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, `h${level}`);
    handleChange();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:')?.trim();
    if (!url) return;
    if (!isSafeLink(url)) {
      alert('Links must start with http://, https://, mailto:, tel: or / (a page on this site).');
      return;
    }
    exec('createLink', url);
  };

  // styleWithCSS makes the browser emit <span style> instead of <font>.
  const applyColor = (color) => {
    setActiveColor(color);
    setShowColorPicker(false);
    editorRef.current?.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, color);
    handleChange();
  };

  const handleFontSize = (e) => {
    const size = e.target.value;
    if (!size) return;
    e.target.value = '';
    editorRef.current?.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontSize', false, size);
    handleChange();
  };

  const handlePaste = (e) => {
    const html = e.clipboardData?.getData('text/html');
    const text = e.clipboardData?.getData('text/plain');
    e.preventDefault();
    const clean = html ? sanitizeHtml(html) : escapeHtml(text || '').replace(/\r\n|\r|\n/g, '<br>');
    if (clean) document.execCommand('insertHTML', false, clean);
    handleChange();
  };

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Built with DOM APIs so the url/alt are never parsed as HTML.
  const insertImage = (url, alt) => {
    const editor = editorRef.current;
    if (!editor || !url) return;
    editor.focus();
    const img = document.createElement('img');
    img.setAttribute('src', url);
    img.setAttribute('alt', alt || 'image');
    img.setAttribute('style', 'max-width:100%;height:auto;border-radius:6px;margin:8px 0;');
    const range = savedRangeRef.current;
    if (range && editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(img);
      range.setStartAfter(img);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    } else {
      editor.appendChild(img);
    }
    savedRangeRef.current = null;
    handleChange();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const invalid = imageFileError(file);
    setUploadError(invalid);
    if (invalid) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      insertImage(url, file.name);
    } catch (err) {
      setUploadError(errorMessage(err, 'Image upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryClick = () => {
    saveRange();
    onOpenGallery?.((url) => insertImage(url, 'gallery-image'));
  };

  const syncValue = useCallback((node) => {
    editorRef.current = node;
    if (!node) return;
    if (node.innerHTML !== value) node.innerHTML = value || '';
    lastHtmlRef.current = node.innerHTML;
  }, [value]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#02028B]/30 focus-within:border-[#02028B]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Text style */}
        <ToolbarButton onClick={() => exec('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />

        {/* Font size */}
        <div className="flex items-center gap-0.5" title="Font Size">
          <Type className="w-3.5 h-3.5 text-gray-500 ml-0.5" />
          <select
            data-testid="font-size-select"
            onChange={handleFontSize}
            defaultValue=""
            onMouseDown={e => e.stopPropagation()}
            className="text-xs text-gray-600 bg-transparent border-none outline-none cursor-pointer pr-1 pl-0.5"
          >
            <option value="" disabled>Size</option>
            {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Color picker */}
        <div ref={colorBtnRef} className="relative">
          <button
            type="button"
            data-testid="text-color-btn"
            title="Text Color"
            onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(p => !p); }}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors flex flex-col items-center gap-0.5"
          >
            <Palette className="w-3.5 h-3.5 text-gray-600" />
            <div className="w-3.5 h-1 rounded-sm" style={{ backgroundColor: activeColor }} />
          </button>
          {showColorPicker && (
            <div
              data-testid="color-picker-popover"
              className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2"
              onMouseDown={e => e.preventDefault()}
            >
              <div className="grid grid-cols-4 gap-1 w-[100px]">
                {COLOR_PALETTE.map(color => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onMouseDown={(e) => { e.preventDefault(); applyColor(color); }}
                    className={`w-5 h-5 rounded border-2 transition-transform hover:scale-110 ${activeColor === color ? 'border-gray-600' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); applyColor('#000000'); }}
                className="mt-1.5 w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                Reset
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Headings */}
        <ToolbarButton onClick={() => insertHeading(1)} title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => insertHeading(2)} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => insertHeading(3)} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', 'blockquote')} title="Quote"><Quote className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => exec('justifyLeft')} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyCenter')} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={insertLink} title="Insert Link"><Link className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />

        {/* Images */}
        <ToolbarButton onClick={() => { if (uploading) return; saveRange(); imageInputRef.current?.click(); }}
          title={uploading ? 'Uploading image...' : 'Upload Image'}>
          {uploading
            ? <div className="w-3.5 h-3.5 border-2 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
            : <ImagePlus className="w-3.5 h-3.5 text-[#02028B]" />}
        </ToolbarButton>
        {onOpenGallery && (
          <ToolbarButton onClick={handleGalleryClick} title="Choose from Gallery">
            <Images className="w-3.5 h-3.5 text-[#02028B]" />
          </ToolbarButton>
        )}
        {uploading && <span className="text-xs text-gray-500 ml-1">Uploading image...</span>}
      </div>

      {uploadError && (
        <div data-testid="rte-upload-error" className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-red-200 bg-red-50 text-xs text-red-700">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="text-red-500 hover:text-red-700">Dismiss</button>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden" onChange={handleImageFileChange} data-testid="rte-image-file-input" />

      {/* Editor area */}
      <div
        ref={syncValue}
        contentEditable
        onInput={handleChange}
        onBlur={handleChange}
        onPaste={handlePaste}
        data-testid="rich-text-editor"
        data-placeholder={placeholder || 'Write your blog content here...'}
        className="min-h-[300px] p-4 text-sm text-gray-700 outline-none prose prose-sm max-w-none
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2
          [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
          [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500
          [&_a]:text-[#02028B] [&_a]:underline
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      />
    </div>
  );
};

export default RichTextEditor;
