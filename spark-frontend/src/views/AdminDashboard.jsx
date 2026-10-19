'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '../context/AuthContext';
import { api, assetUrl, errorMessage } from '../lib/api';
import { sanitizeHtml } from '../lib/sanitize';
import {
  PlusCircle, Pencil, Trash2, LogOut, Eye, EyeOff,
  CheckCircle, XCircle, BookOpen, ChevronRight, X, Save,
  AlertCircle, Search, Mail, Phone, MessageSquare,
  Tag, Globe, Upload, ImageIcon, User, Calendar,
  Images, Users, UserPlus, Copy, Check, Shield, Download, KeyRound, FileUp, ChevronDown
} from 'lucide-react';
import MarkdownEditor, { PREVIEW_PROSE, useMarkdownPreview } from '../components/MarkdownEditor';
import { imageFileError, uploadImage } from '../lib/images';
import { downloadMarkdown, fileToPost, postToFile, TEMPLATE_MD } from '../lib/markdownPost';

const CATEGORIES = ['Technology', 'AI & Technology', 'DevOps', 'Mobile Development', 'Web Development', 'Cloud', 'Digital Marketing', 'Business'];

const emptyForm = {
  title: '', slug: '', excerpt: '', content_md: '',
  image_url: '', author: 'SparkCurv Team', category: 'Technology',
  tags: [], published: true, meta_title: '', meta_description: ''
};

const sideHeading = 'text-xs font-semibold uppercase tracking-wider text-gray-500';

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all";

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

// Must match the backend minimum for admin passwords.
const MIN_PASSWORD = 10;

const Spinner = ({ className = 'w-8 h-8 border-4' }) => (
  <div className={`${className} border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin`} />
);

// Absolute link for the clipboard (stored urls are relative "/api/images/<id>").
const copyImageUrl = (url) => {
  const href = new URL(assetUrl(url), window.location.origin).href;
  return navigator.clipboard ? navigator.clipboard.writeText(href) : Promise.reject(new Error('Clipboard unavailable'));
};

// ── Cover Image Uploader ──────────────────────────────────────────────────────

const CoverImageUploader = ({ value, onChange, onOpenGallery }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [error, setError] = useState('');
  const [brokenUrl, setBrokenUrl] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    const invalid = imageFileError(file);
    setError(invalid);
    if (invalid) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) { setError(errorMessage(err, 'Upload failed. Please try again or paste a URL.')); }
    finally { setUploading(false); }
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  const errorLine = error && (
    <p data-testid="cover-image-error" className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
    </p>
  );

  if (value && !urlMode) {
    return (
      <div>
        <div className="relative group">
          {brokenUrl === value ? (
            <div data-testid="cover-image-broken"
              className="w-full h-40 rounded-lg border border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center gap-1 px-3 text-center">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              <p className="text-xs font-medium text-amber-700">Could not load preview</p>
              <p className="text-[10px] text-amber-600 break-all line-clamp-2">{value}</p>
            </div>
          ) : (
            <img src={assetUrl(value)} alt="Cover" data-testid="cover-image-preview"
              className="w-full h-40 object-cover rounded-lg border border-gray-200" onError={() => setBrokenUrl(value)} />
          )}
          {uploading ? (
            <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-gray-700">
              <Spinner className="w-5 h-5 border-2" />Uploading...
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-50">
                <Upload className="w-3.5 h-3.5" />Replace
              </button>
              <button type="button" onClick={() => { setError(''); onChange(''); }}
                className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-red-600">
                <X className="w-3.5 h-3.5" />Remove
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden"
            onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
        {errorLine}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {urlMode ? (
        <div className="flex gap-2">
          <input data-testid="blog-image-url-input" type="url" value={value} onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/cover.jpg" className={inputCls + ' flex-1'} />
          <button type="button" onClick={() => setUrlMode(false)}
            className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div data-testid="cover-image-upload-zone"
          onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => { if (!uploading) fileRef.current?.click(); }}
          className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:border-[#02028B]/40 hover:bg-blue-50/30 transition-all cursor-pointer">
          {uploading
            ? <><Spinner className="w-6 h-6 border-2" /><p className="text-xs text-gray-500">Uploading...</p></>
            : <><ImageIcon className="w-7 h-7 text-gray-300" /><p className="text-sm text-gray-500 font-medium">Click or drag image</p><p className="text-xs text-gray-400">JPEG, PNG, GIF, WebP — max 5 MB</p></>
          }
        </div>
      )}
      {errorLine}
      <div className="flex items-center gap-3 text-xs">
        <button type="button" onClick={() => setUrlMode(v => !v)} className="text-[#02028B] hover:underline">
          {urlMode ? 'Upload a file instead' : 'Paste URL instead'}
        </button>
        {onOpenGallery && (
          <><span className="text-gray-300">|</span>
          <button type="button" onClick={() => onOpenGallery(onChange)} className="text-[#02028B] hover:underline flex items-center gap-1">
            <Images className="w-3 h-3" />Choose from gallery
          </button></>
        )}
      </div>
      <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden"
        data-testid="cover-image-file-input"
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
};

// ── Tag Input ─────────────────────────────────────────────────────────────────

const TagInput = ({ value, onChange }) => {
  const [input, setInput] = useState('');

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (tag && !value.includes(tag)) onChange([...value, tag]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); setInput(''); }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1));
  };

  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-[#02028B]/30 focus-within:border-[#02028B] transition-all min-h-[42px] cursor-text"
      onClick={e => e.currentTarget.querySelector('input')?.focus()}>
      {value.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#02028B] text-xs rounded-full font-medium">
          #{tag}
          <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}
            className="text-[#02028B]/60 hover:text-[#02028B] leading-none"><X className="w-2.5 h-2.5" /></button>
        </span>
      ))}
      <input
        data-testid="tag-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? 'Add tags — type and press Enter' : ''}
        className="flex-1 min-w-[140px] text-sm outline-none bg-transparent placeholder-gray-400"
      />
    </div>
  );
};

// ── Blog Preview Modal ────────────────────────────────────────────────────────

const BlogPreviewModal = ({ form, onClose }) => {
  const preview = useMarkdownPreview(form.content_md, { delay: 0 });
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div data-testid="blog-preview-modal" className="fixed inset-0 z-[60] bg-black/60 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#02028B]" />
          <span className="text-sm font-semibold text-gray-800">Post Preview</span>
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Not yet saved</span>
        </div>
        <button data-testid="close-preview-btn" onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />Close Preview
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="pt-10 pb-24 max-w-4xl mx-auto px-6 lg:px-12">
          <span className="inline-block px-4 py-1 bg-blue-50 border border-blue-200 text-[#02028B] text-xs uppercase tracking-wider rounded-sm mb-6">
            {form.category || 'Technology'}
          </span>
          <h1 className="font-clash text-4xl sm:text-5xl font-semibold tracking-tighter mb-6 text-gray-900 leading-tight">
            {form.title || <span className="text-gray-300">Untitled Post</span>}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-4">
            <span className="flex items-center gap-2"><User className="w-5 h-5" /><span className="text-sm">{form.author || 'SparkCurv Team'}</span></span>
            <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /><span className="text-sm">{formatDate(new Date())}</span></span>
          </div>
          {form.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-[#02028B] text-xs font-medium rounded-full">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}
          {form.image_url && (
            <div className="mb-12 rounded-lg overflow-hidden border border-gray-200">
              <img src={assetUrl(form.image_url)} alt={form.title} className="w-full h-[400px] object-cover" onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
          {form.excerpt && <p className="text-lg text-gray-500 leading-relaxed mb-8">{form.excerpt}</p>}
          {!form.content_md.trim()
            ? <p className="text-gray-300 text-lg italic">Content will appear here...</p>
            : preview.error
              ? <p className="text-sm text-red-600">{preview.error}</p>
              : <div className={`${PREVIEW_PROSE} prose-lg`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(preview.html) }} />
          }
        </div>
      </div>
    </div>
  );
};

// ── Image Gallery Modal ────────────────────────────────────────────────────────

// Picker used by the cover uploader and the Markdown editor. onSelect receives
// the relative "/api/images/<id>" url.
const ImageGalleryModal = ({ onSelect, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    api.get('/images')
      .then(res => setImages(res.data))
      .catch(err => { setImages([]); setLoadError(errorMessage(err, 'Failed to load images.')); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image permanently?')) return;
    setDeleting(id);
    try {
      await api.delete(`/images/${id}`);
      setImages(imgs => imgs.filter(i => i.id !== id));
    } catch (err) { alert(errorMessage(err, 'Failed to delete image.')); }
    finally { setDeleting(null); }
  };

  const copyUrl = (url) => {
    copyImageUrl(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => alert('Could not copy the URL.'));
  };

  return (
    <div data-testid="image-gallery-modal" className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-[#02028B]" />
            <h2 className="text-base font-semibold text-gray-900">Image Gallery</h2>
            {images.length > 0 && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{images.length} images</span>}
          </div>
          <button data-testid="close-gallery-btn" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : loadError ? (
            <div className="text-center py-16 text-red-600">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-60" />
              <p className="text-sm">{loadError}</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No images uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map(img => (
                <div key={img.id} data-testid={`gallery-image-${img.id}`}
                  className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-[#02028B] transition-all ${onSelect ? 'cursor-pointer' : ''}`}
                  onClick={() => onSelect?.(img.url)}>
                  <img src={assetUrl(img.url)} alt={img.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                    <button type="button" onClick={(e) => { e.stopPropagation(); copyUrl(img.url); }}
                      title="Copy URL"
                      className="p-1.5 bg-white/90 rounded-md text-gray-700 hover:bg-white transition-colors">
                      {copied === img.url ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                      disabled={deleting === img.id}
                      title="Delete"
                      className="p-1.5 bg-white/90 rounded-md text-red-500 hover:bg-white transition-colors disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Filename tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] truncate">{img.filename}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {onSelect && (
          <div className="px-6 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400 text-center">Click an image to select it</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Change Password ───────────────────────────────────────────────────────────

const emptyPasswords = { current_password: '', new_password: '', confirm: '' };

const ChangePasswordForm = ({ onChanged, onCancel }) => {
  const [values, setValues] = useState(emptyPasswords);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setValues(v => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (values.new_password.length < MIN_PASSWORD) { setError(`New password must be at least ${MIN_PASSWORD} characters`); return; }
    if (values.new_password !== values.confirm) { setError('New passwords do not match'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        current_password: values.current_password, new_password: values.new_password,
      });
    } catch (err) {
      setError(errorMessage(err, 'Failed to change password'));
      setSaving(false);
      return;
    }
    onChanged();
  };

  return (
    <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/30">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">Change Your Password</h3>
      <p className="text-xs text-gray-500 mb-4">You will be signed out and asked to sign in again with the new password.</p>
      {error && (
        <div data-testid="change-password-error" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-3">
        <input data-testid="current-password-input" type="password" autoComplete="current-password" value={values.current_password}
          onChange={set('current_password')} required placeholder="Current password" className={inputCls} />
        <input data-testid="new-password-input" type="password" autoComplete="new-password" value={values.new_password}
          onChange={set('new_password')} required placeholder={`New password (min ${MIN_PASSWORD} chars)`} className={inputCls} />
        <input data-testid="confirm-password-input" type="password" autoComplete="new-password" value={values.confirm}
          onChange={set('confirm')} required placeholder="Confirm new password" className={inputCls} />
        <div className="sm:col-span-3 flex items-center gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button data-testid="save-password-btn" type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : <><KeyRound className="w-4 h-4" />Update Password</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('blogs');

  // Blogs
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Editor
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editorError, setEditorError] = useState('');
  const [legacyHtml, setLegacyHtml] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const editorFormRef = useRef(null);
  const editorErrorRef = useRef(null);
  const importRef = useRef(null);

  // Gallery modal
  const [galleryCallback, setGalleryCallback] = useState(null);

  // Contacts
  const [contacts, setContacts] = useState([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [expandedContact, setExpandedContact] = useState(null);

  // Admin users
  const [adminUsers, setAdminUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '' });
  const [addingUser, setAddingUser] = useState(false);
  const [userError, setUserError] = useState('');
  const [deletingUser, setDeletingUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Each toast replaces the previous one and its timer, so an old timer can't close a newer toast.
  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBlogs = useCallback(async () => {
    setBlogsLoading(true);
    try {
      const { data } = await api.get('/blogs/all');
      setBlogs(data);
    } catch (err) { showToast(errorMessage(err, 'Failed to load blogs'), 'error'); }
    finally { setBlogsLoading(false); }
  }, [showToast]);

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const { data } = await api.get('/contact');
      setContacts(data);
      setContactsLoaded(true);
    } catch (err) { showToast(errorMessage(err, 'Failed to load contacts'), 'error'); }
    finally { setContactsLoading(false); }
  }, [showToast]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setAdminUsers(data);
    } catch (err) { showToast(errorMessage(err, 'Failed to load users'), 'error'); }
    finally { setUsersLoading(false); }
  }, [showToast]);

  // Contacts are loaded up front so the "Enquiries" stat has a real count.
  useEffect(() => { fetchBlogs(); fetchContacts(); }, [fetchBlogs, fetchContacts]);
  useEffect(() => {
    if (editorError) editorErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [editorError]);
  useEffect(() => { if (activeTab === 'contacts' && !contactsLoaded) fetchContacts(); }, [activeTab, contactsLoaded, fetchContacts]);
  useEffect(() => { if (activeTab === 'team' && adminUsers.length === 0) fetchUsers(); }, [activeTab, adminUsers.length, fetchUsers]);

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filteredBlogs = useMemo(() => blogs.filter(b => {
    const ms = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    const mc = filterCategory === 'all' || b.category === filterCategory;
    const mst = filterStatus === 'all' || (filterStatus === 'published' ? b.published : !b.published);
    return ms && mc && mst;
  }), [blogs, search, filterCategory, filterStatus]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.services?.toLowerCase().includes(q));
  }, [contacts, contactSearch]);

  // ── Blog CRUD ─────────────────────────────────────────────────────────────

  const handleLogout = async () => { await logout(); navigate('/admin/login'); };

  const startEditing = (initial, id, legacy = false) => {
    setForm(initial); setInitialForm(initial);
    setEditingId(id); setEditorError(''); setLegacyHtml(legacy);
    setSeoOpen(Boolean(initial.meta_title || initial.meta_description));
    setShowEditor(true);
  };

  const editorDirty = showEditor && JSON.stringify(form) !== JSON.stringify(initialForm);
  const slugPreview = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

  // While the editor is open: Ctrl/Cmd+S saves, and the page behind it doesn't scroll.
  useEffect(() => {
    if (!showEditor) return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        editorFormRef.current?.requestSubmit();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [showEditor]);

  const openCreate = () => startEditing(emptyForm, null);

  const openEdit = (blog) => startEditing({
    title: blog.title, slug: blog.slug, excerpt: blog.excerpt,
    content_md: blog.content_md ?? blog.content ?? '', image_url: blog.image_url || '',
    author: blog.author, category: blog.category,
    tags: blog.tags || [], published: blog.published,
    meta_title: blog.meta_title || '', meta_description: blog.meta_description || ''
  }, blog.id, blog.content_md == null && Boolean(blog.content));

  const closeEditor = () => {
    if (editorDirty && !window.confirm('Discard your unsaved changes?')) return;
    setShowEditor(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content_md.trim()) { setEditorError('Title, excerpt, and content are required.'); return; }
    // A blank slug is omitted: the server generates one on create and keeps the existing one on update.
    const payload = { ...form, slug: form.slug.trim() };
    if (!payload.slug) delete payload.slug;
    setSaving(true); setEditorError('');
    try {
      if (editingId) {
        await api.put(`/blogs/${editingId}`, payload);
        showToast('Blog updated successfully');
      } else {
        await api.post('/blogs', payload);
        showToast('Blog created successfully');
      }
      setShowEditor(false); fetchBlogs();
    } catch (err) { setEditorError(errorMessage(err, 'Failed to save blog')); }
    finally { setSaving(false); }
  };

  // Import a Markdown file (front matter fills the fields it names; see lib/markdownPost).
  const handleImport = async (file) => {
    if (!file) return;
    if (file.size > 2_000_000) { setEditorError('That file is over 2 MB.'); return; }
    const post = fileToPost(await file.text());
    if (form.content_md.trim() && !window.confirm('Replace the current content with this file?')) return;
    setForm(f => ({ ...f, ...post, tags: post.tags ?? f.tags }));
    setLegacyHtml(false);
    setEditorError('');
    showToast(`Imported ${file.name}`);
  };

  const handleExport = () => {
    const name = (form.slug || form.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'post';
    downloadMarkdown(`${name}.md`, postToFile(form));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    setDeleting(id);
    try { await api.delete(`/blogs/${id}`); showToast('Blog deleted'); fetchBlogs(); }
    catch (err) { showToast(errorMessage(err, 'Failed to delete blog'), 'error'); }
    finally { setDeleting(null); }
  };

  const togglePublish = async (blog) => {
    try {
      await api.put(`/blogs/${blog.id}`, { published: !blog.published });
      showToast(blog.published ? 'Blog unpublished' : 'Blog published'); fetchBlogs();
    } catch (err) { showToast(errorMessage(err, 'Failed to update status'), 'error'); }
  };

  // ── Admin Users ───────────────────────────────────────────────────────────

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserError('');
    if (newUser.password.length < MIN_PASSWORD) { setUserError(`Password must be at least ${MIN_PASSWORD} characters`); return; }
    setAddingUser(true);
    try {
      await api.post('/admin/users', newUser);
      showToast(`Admin "${newUser.name}" added`);
      setNewUser({ email: '', name: '', password: '' });
      setShowAddUser(false);
      fetchUsers();
    } catch (err) { setUserError(errorMessage(err, 'Failed to add user')); }
    finally { setAddingUser(false); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Remove admin access for "${name}"?`)) return;
    setDeletingUser(id);
    try {
      await api.delete(`/admin/users/${id}`);
      showToast(`${name} removed`); fetchUsers();
    } catch (err) { showToast(errorMessage(err, 'Failed to remove user'), 'error'); }
    finally { setDeletingUser(null); }
  };

  // The server invalidates the session after a password change, so sign out locally too.
  const handlePasswordChanged = async () => {
    await logout();
    navigate('/admin/login', { replace: true, state: { notice: 'Password updated — please sign in again.' } });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  const TABS = [
    { id: 'blogs', label: 'Blog Posts', icon: BookOpen },
    { id: 'contacts', label: 'Leads', icon: Mail },
    { id: 'media', label: 'Media', icon: Images },
    { id: 'team', label: 'Team', icon: Users },
  ];

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/images/logo/sparkcurv1.webp" alt="SparkCurv" style={{ width: '140px', height: 'auto', mixBlendMode: 'multiply' }} />
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-700">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/blog" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#02028B] transition-colors">
              <BookOpen className="w-4 h-4" /><span className="hidden sm:inline">View Blog</span>
            </a>
            <button
              type="button"
              onClick={() => downloadMarkdown('sparkcurv-blog-template.md', TEMPLATE_MD)}
              data-testid="download-template-btn"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#02028B] transition-colors"
              title="Download a Markdown template: write the post anywhere, then use Import .md"
            >
              <Download className="w-4 h-4" /><span className="hidden sm:inline">Template</span>
            </button>
            <span className="text-sm text-gray-500 hidden sm:block">{admin?.email}</span>
            <button data-testid="logout-btn" onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Posts', value: blogs.length, icon: BookOpen, color: 'text-[#02028B]', bg: 'bg-blue-50' },
            { label: 'Published', value: blogs.filter(b => b.published).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Draft', value: blogs.filter(b => !b.published).length, icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
            { label: 'Enquiries', value: contactsLoaded ? contacts.length : '—', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#02028B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── BLOGS TAB ── */}
        {activeTab === 'blogs' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Blog Posts</h2>
                <button data-testid="create-blog-btn" onClick={openCreate}
                  className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
                  <PlusCircle className="w-4 h-4" />New Post
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input data-testid="blog-search-input" type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search posts..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 transition-all" />
                </div>
                <select data-testid="filter-category-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 bg-white transition-all">
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select data-testid="filter-status-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 bg-white transition-all">
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              {(search || filterCategory !== 'all' || filterStatus !== 'all') && (
                <p className="text-xs text-gray-400">{filteredBlogs.length} result{filteredBlogs.length !== 1 ? 's' : ''} found
                  <button onClick={() => { setSearch(''); setFilterCategory('all'); setFilterStatus('all'); }} className="ml-2 text-[#02028B] hover:underline">Clear</button>
                </p>
              )}
            </div>

            {blogsLoading
              ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" /></div>
              : filteredBlogs.length === 0
              ? <div className="text-center py-20 text-gray-400"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{blogs.length === 0 ? 'No blog posts yet. Create your first one!' : 'No posts match your search.'}</p></div>
              : (
                <div className="divide-y divide-gray-100">
                  {filteredBlogs.map(blog => (
                    <div key={blog.id} data-testid={`blog-row-${blog.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      {blog.image_url && (
                        <img src={assetUrl(blog.image_url)} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block border border-gray-100" onError={e => { e.target.style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h3>
                          <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${blog.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                          {blog.meta_title && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
                              <Globe className="w-3 h-3" />SEO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{blog.excerpt}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400">{blog.category}</span>
                          <span className="text-xs text-gray-300">&bull;</span>
                          <span className="text-xs text-gray-400">{formatDate(blog.created_at)}</span>
                          {blog.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-blue-50 text-[#02028B] px-1.5 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button data-testid={`toggle-publish-${blog.id}`} onClick={() => togglePublish(blog)} title={blog.published ? 'Unpublish' : 'Publish'}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#02028B] hover:bg-blue-50 transition-colors">
                          {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button data-testid={`edit-blog-${blog.id}`} onClick={() => openEdit(blog)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#02028B] hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button data-testid={`delete-blog-${blog.id}`} onClick={() => handleDelete(blog.id)} disabled={deleting === blog.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {blog.published && (
                          <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {activeTab === 'contacts' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Contact Leads</h2>
                <button onClick={fetchContacts} className="text-sm text-[#02028B] hover:underline">Refresh</button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input data-testid="contact-search-input" type="text" value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                  placeholder="Search by name, email, or service..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 transition-all" />
              </div>
            </div>
            {contactsLoading
              ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" /></div>
              : filteredContacts.length === 0
              ? <div className="text-center py-20 text-gray-400"><Mail className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{contacts.length === 0 ? 'No enquiries yet.' : 'No contacts match your search.'}</p></div>
              : (
                <div className="divide-y divide-gray-100">
                  {filteredContacts.map(contact => (
                    <div key={contact.id} data-testid={`contact-row-${contact.id}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4 cursor-pointer" onClick={() => setExpandedContact(expandedContact === contact.id ? null : contact.id)}>
                        <div className="w-10 h-10 rounded-full bg-[#02028B]/10 flex items-center justify-center flex-shrink-0 text-[#02028B] font-semibold text-sm">
                          {contact.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(contact.created_at)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.mobile}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#02028B] font-medium">
                              <Tag className="w-3 h-3" />{contact.services}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedContact === contact.id ? 'rotate-90' : ''}`} />
                      </div>
                      {expandedContact === contact.id && (
                        <div className="mt-4 ml-14 space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">WhatsApp</p>
                              <a href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#02028B] hover:underline">{contact.whatsapp || '—'}</a>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                              <a href={`mailto:${contact.email}`} className="text-sm text-[#02028B] hover:underline">{contact.email}</a>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{contact.description || '—'}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-[#02028B] text-white rounded-lg hover:bg-[#0303b5] transition-colors">
                              <Mail className="w-3.5 h-3.5" />Reply via Email
                            </a>
                            {contact.whatsapp && (
                              <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <MessageSquare className="w-3.5 h-3.5" />WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── MEDIA TAB ── */}
        {activeTab === 'media' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-[#02028B]" />
                <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
              </div>
            </div>
            <MediaLibrary />
          </div>
        )}

        {/* ── TEAM TAB ── */}
        {activeTab === 'team' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#02028B]" />
                <h2 className="text-base font-semibold text-gray-900">Admin Team</h2>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid="change-password-btn" onClick={() => setShowChangePassword(v => !v)}
                  className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  <KeyRound className="w-4 h-4" /><span className="hidden sm:inline">Change Password</span>
                </button>
                <button data-testid="add-admin-btn" onClick={() => { setShowAddUser(true); setUserError(''); }}
                  className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  <UserPlus className="w-4 h-4" />Add Admin
                </button>
              </div>
            </div>

            {showChangePassword && (
              <ChangePasswordForm onChanged={handlePasswordChanged} onCancel={() => setShowChangePassword(false)} />
            )}

            {/* Add user form */}
            {showAddUser && (
              <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/30">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">New Admin Account</h3>
                {userError && (
                  <div data-testid="user-error" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{userError}
                  </div>
                )}
                <form onSubmit={handleAddUser} className="grid sm:grid-cols-3 gap-3">
                  <input data-testid="new-admin-name" type="text" value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                    required placeholder="Full name" className={inputCls} />
                  <input data-testid="new-admin-email" type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                    required placeholder="Email address" className={inputCls} />
                  <input data-testid="new-admin-password" type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                    required placeholder={`Password (min ${MIN_PASSWORD} chars)`} className={inputCls} />
                  <div className="sm:col-span-3 flex items-center gap-2 justify-end">
                    <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    <button data-testid="save-admin-btn" type="submit" disabled={addingUser}
                      className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                      {addingUser ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding...</> : <><UserPlus className="w-4 h-4" />Add Admin</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {usersLoading
              ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" /></div>
              : (
                <div className="divide-y divide-gray-100">
                  {adminUsers.map(user => (
                    <div key={user.id} data-testid={`admin-user-row-${user.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#02028B]/10 flex items-center justify-center flex-shrink-0 text-[#02028B] font-bold text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name || '—'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Added {formatDate(user.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-[#02028B]/10 text-[#02028B] rounded-full">
                          <Shield className="w-3 h-3" />Admin
                        </span>
                        {user.email !== admin?.email && (
                          <button data-testid={`remove-admin-${user.id}`} onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                            disabled={deletingUser === user.id}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {user.email === admin?.email && (
                          <span className="text-xs text-gray-400 italic">(you)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </main>

      {/* ── BLOG EDITOR (full screen: writing on the left, post settings on the right) ── */}
      {showEditor && (
        <div data-testid="blog-editor-modal" role="dialog" aria-modal="true" aria-labelledby="blog-editor-title"
          className="fixed inset-0 z-50 flex flex-col bg-gray-50">
          {/* Top bar */}
          <div className="flex h-14 flex-shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button type="button" onClick={closeEditor} aria-label="Close editor"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
              <h2 id="blog-editor-title" className="truncate text-sm font-semibold text-gray-900">{editingId ? 'Edit post' : 'New post'}</h2>
              <span className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${form.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {form.published ? 'Published' : 'Draft'}
              </span>
              {editorDirty && <span className="hidden text-xs text-amber-600 md:inline">Unsaved changes</span>}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button type="button" onClick={() => importRef.current?.click()} data-testid="import-md-btn" title="Import a Markdown file"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                <FileUp className="h-4 w-4" /><span className="hidden md:inline">Import .md</span>
              </button>
              <input ref={importRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" className="hidden"
                data-testid="import-md-input" onChange={e => { handleImport(e.target.files[0]); e.target.value = ''; }} />
              <button type="button" onClick={handleExport} data-testid="export-md-btn" title="Download this post as Markdown"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                <Download className="h-4 w-4" /><span className="hidden md:inline">Download .md</span>
              </button>
              <button type="button" onClick={() => setShowPreview(true)} data-testid="preview-blog-btn"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <Eye className="h-4 w-4" /><span className="hidden sm:inline">Preview</span>
              </button>
              <button data-testid="save-blog-btn" type="submit" form="blog-editor-form" disabled={saving} title="Save (Ctrl+S)"
                className="flex items-center gap-2 rounded-lg bg-[#02028B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0303b5] disabled:bg-gray-300">
                {saving
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</>
                  : <><Save className="h-4 w-4" />{editingId ? 'Update' : form.published ? 'Publish' : 'Save draft'}</>}
              </button>
            </div>
          </div>

          <form id="blog-editor-form" ref={editorFormRef} onSubmit={handleSave}
            className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:overflow-hidden">
            {/* Writing */}
            <div className="flex min-h-0 flex-col gap-5 p-4 sm:p-6 lg:overflow-y-auto">
              {editorError && (
                <div ref={editorErrorRef} data-testid="editor-error" role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{editorError}
                </div>
              )}
              <div>
                <label htmlFor="blog-title" className="sr-only">Title</label>
                <input id="blog-title" data-testid="blog-title-input" type="text" value={form.title} required maxLength={500}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Post title"
                  className="w-full border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight text-gray-900 placeholder:text-gray-300 focus:outline-none sm:text-3xl" />
              </div>
              <div>
                <label htmlFor="blog-excerpt" className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-gray-700">
                  <span>Excerpt <span className="text-red-500">*</span></span>
                  <span className="text-xs font-normal text-gray-400">Shown on the blog listing</span>
                </label>
                <textarea id="blog-excerpt" data-testid="blog-excerpt-input" value={form.excerpt} required rows={2} maxLength={2000}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Two or three sentences that tell readers what they'll get from the post."
                  className={inputCls + ' resize-none bg-white'} />
              </div>
              <MarkdownEditor
                value={form.content_md}
                onChange={content_md => setForm(f => ({ ...f, content_md }))}
                onOpenGallery={(insertFn) => setGalleryCallback(() => insertFn)}
                notice={legacyHtml ? 'This post was written in the old editor, so its content is HTML. It still renders as before; you can replace it with Markdown at any time.' : null}
                className="h-[75vh] lg:h-auto lg:min-h-[28rem] lg:flex-1" />
            </div>

            {/* Settings */}
            <aside aria-label="Post settings" className="space-y-7 border-t border-gray-200 bg-white p-4 sm:p-6 lg:overflow-y-auto lg:border-l lg:border-t-0">
              <section>
                <h3 className={sideHeading}>Status</h3>
                <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 transition-colors hover:bg-gray-50">
                  <span>
                    <span className="block text-sm font-medium text-gray-800">Published</span>
                    <span className="block text-xs text-gray-500">{form.published ? 'Visible on the blog' : 'Saved as a draft, not visible'}</span>
                  </span>
                  <input data-testid="blog-published-checkbox" type="checkbox" checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#02028B] focus:ring-[#02028B]" />
                </label>
              </section>

              <section>
                <h3 className={sideHeading}>Cover image</h3>
                <div className="mt-3">
                  <CoverImageUploader value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))}
                    onOpenGallery={(cb) => setGalleryCallback(() => cb)} />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className={sideHeading}>Details</h3>
                <div>
                  <label htmlFor="blog-category" className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                  <select id="blog-category" data-testid="blog-category-select" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={inputCls + ' bg-white'}>
                    {[...new Set([...CATEGORIES, form.category].filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="blog-author" className="mb-1.5 block text-sm font-medium text-gray-700">Author</label>
                  <input id="blog-author" data-testid="blog-author-input" type="text" value={form.author} maxLength={255}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    placeholder="SparkCurv Team" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="blog-slug" className="mb-1.5 block text-sm font-medium text-gray-700">URL</label>
                  <div className="flex items-center rounded-lg border border-gray-200 focus-within:border-[#02028B] focus-within:ring-2 focus-within:ring-[#02028B]/30">
                    <span className="pl-3 text-sm text-gray-400">/blog/</span>
                    <input id="blog-slug" data-testid="blog-slug-input" type="text" value={form.slug} maxLength={200}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder={slugPreview || 'from-the-title'}
                      className="w-full min-w-0 rounded-r-lg border-0 bg-transparent px-1 py-2.5 text-sm focus:outline-none" />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Leave blank to use the title.</p>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Tags</span>
                  <TagInput value={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
                  <p className="mt-1 text-xs text-gray-400">Press Enter or comma after each tag.</p>
                </div>
              </section>

              <section>
                <button type="button" onClick={() => setSeoOpen(o => !o)} aria-expanded={seoOpen}
                  className="flex w-full items-center justify-between text-left">
                  <span className={sideHeading}>Search engines <span className="font-normal normal-case tracking-normal text-gray-400">(optional)</span></span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
                </button>
                {seoOpen && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="blog-meta-title" className="mb-1.5 flex justify-between text-sm font-medium text-gray-700">
                        Meta title <span className="text-xs font-normal text-gray-400">{form.meta_title.length}/60</span>
                      </label>
                      <input id="blog-meta-title" data-testid="blog-meta-title-input" type="text" value={form.meta_title} maxLength={60}
                        onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                        placeholder="Defaults to the post title" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="blog-meta-desc" className="mb-1.5 flex justify-between text-sm font-medium text-gray-700">
                        Meta description <span className="text-xs font-normal text-gray-400">{form.meta_description.length}/160</span>
                      </label>
                      <textarea id="blog-meta-desc" data-testid="blog-meta-desc-input" value={form.meta_description} maxLength={160} rows={3}
                        onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                        placeholder="Defaults to the excerpt" className={inputCls + ' resize-none'} />
                    </div>
                    {/* How the post could look in search results */}
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="truncate text-xs text-gray-500">sparkcurv.com › blog › {form.slug || slugPreview || '…'}</p>
                      <p className="mt-1 line-clamp-1 text-base text-[#1a0dab]">{form.meta_title || form.title || 'Post title'}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-600">{form.meta_description || form.excerpt || 'The description shown under the title.'}</p>
                    </div>
                  </div>
                )}
              </section>
            </aside>
          </form>
        </div>
      )}

      {/* Preview */}
      {showPreview && <BlogPreviewModal form={form} onClose={() => setShowPreview(false)} />}

      {/* Gallery modal (shared - triggered by cover uploader or RTE) */}
      {galleryCallback && (
        <ImageGalleryModal
          onSelect={(url) => { galleryCallback(url); setGalleryCallback(null); }}
          onClose={() => setGalleryCallback(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div data-testid="toast-notification"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

// Inline media library for the Media tab (no select callback, just view/delete/copy)
const MediaLibrary = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get('/images');
      setImages(data);
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load images.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    setDeleting(id);
    try {
      await api.delete(`/images/${id}`);
      setImages(imgs => imgs.filter(i => i.id !== id));
    } catch (err) { alert(errorMessage(err, 'Delete failed.')); }
    finally { setDeleting(null); }
  };

  const copyUrl = (url) => {
    copyImageUrl(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => alert('Could not copy the URL.'));
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner /></div>;

  if (loadError) return (
    <div data-testid="media-library-error" className="text-center py-20 text-red-600">
      <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-60" />
      <p className="text-sm mb-3">{loadError}</p>
      <button type="button" onClick={load} className="text-sm text-[#02028B] hover:underline">Try again</button>
    </div>
  );

  if (images.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No images uploaded yet. Upload one through the blog editor.</p>
    </div>
  );

  return (
    <div className="p-4" data-testid="media-library">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {images.map(img => (
          <div key={img.id} data-testid={`media-image-${img.id}`}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-[#02028B] transition-all">
            <img src={assetUrl(img.url)} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => copyUrl(img.url)} title="Copy URL"
                className="p-1.5 bg-white/90 rounded-md text-gray-700 hover:bg-white transition-colors">
                {copied === img.url ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button type="button" onClick={() => handleDelete(img.id)} disabled={deleting === img.id} title="Delete"
                className="p-1.5 bg-white/90 rounded-md text-red-500 hover:bg-white transition-colors disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-[9px] truncate">{img.filename}</p>
              <p className="text-white/70 text-[8px]">{formatDate(img.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
