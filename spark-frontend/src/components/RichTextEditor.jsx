import { useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Heading3, Link, AlignLeft, AlignCenter, Quote, ImagePlus
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ToolbarButton = ({ onClick, title, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className="p-1.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleChange = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
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
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = '';

    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await axios.post(`${API}/api/upload/image`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Insert image at cursor
      editorRef.current?.focus();
      document.execCommand('insertHTML', false,
        `<img src="${API}${data.url}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:6px;margin:8px 0;" />`
      );
      handleChange();
    } catch {
      alert('Image upload failed. Please try again.');
    }
  };

  const syncValue = useCallback((node) => {
    editorRef.current = node;
    if (node && node.innerHTML !== value) {
      node.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#02028B]/30 focus-within:border-[#02028B]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarButton onClick={() => exec('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => insertHeading(1)} title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => insertHeading(2)} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => insertHeading(3)} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', 'blockquote')} title="Quote"><Quote className="w-3.5 h-3.5" /></ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => exec('justifyLeft')} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyCenter')} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={insertLink} title="Insert Link"><Link className="w-3.5 h-3.5" /></ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Insert Image">
          <ImagePlus className="w-3.5 h-3.5 text-[#02028B]" />
        </ToolbarButton>
      </div>

      {/* Hidden image file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageFileChange}
        data-testid="rte-image-file-input"
      />

      {/* Editor */}
      <div
        ref={syncValue}
        contentEditable
        onInput={handleChange}
        onBlur={handleChange}
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
