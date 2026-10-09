import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  PlusCircle, Pencil, Trash2, LogOut, Eye, EyeOff,
  CheckCircle, XCircle, BookOpen, ChevronRight, X, Save,
  AlertCircle, Search, Mail, Phone, MessageSquare,
  Tag, Globe, Upload, ImageIcon, User, Calendar,
  Images, Users, UserPlus, Copy, Check, Shield, Download
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['Technology', 'AI & Technology', 'DevOps', 'Mobile Development', 'Web Development', 'Cloud', 'Digital Marketing', 'Business'];

const emptyForm = {
  title: '', slug: '', excerpt: '', content: '',
  image_url: '', author: 'SparkCurv Team', category: 'Technology',
  tags: [], published: true, meta_title: '', meta_description: ''
};

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all";

// ── Cover Image Uploader ──────────────────────────────────────────────────────

const CoverImageUploader = ({ value, onChange, onOpenGallery }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await axios.post(`${API}/api/upload/image`, fd, {
        withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(`${API}${data.url}`);
    } catch { alert('Upload failed. Please try again or paste a URL.'); }
    finally { setUploading(false); }
  };

  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f); };

  if (value && !urlMode) {
    return (
      <div className="relative group">
        <img src={value} alt="Cover" data-testid="cover-image-preview"
          className="w-full h-40 object-cover rounded-lg border border-gray-200" onError={() => onChange('')} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-50">
            <Upload className="w-3.5 h-3.5" />Replace
          </button>
          <button type="button" onClick={() => onChange('')}
            className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-red-600">
            <X className="w-3.5 h-3.5" />Remove
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />
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
          onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:border-[#02028B]/40 hover:bg-blue-50/30 transition-all cursor-pointer">
          {uploading
            ? <div className="w-6 h-6 border-2 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
            : <><ImageIcon className="w-7 h-7 text-gray-300" /><p className="text-sm text-gray-500 font-medium">Click or drag image</p><p className="text-xs text-gray-400">JPEG, PNG, WebP — max 5 MB</p></>
          }
        </div>
      )}
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
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
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
              <img src={form.image_url} alt={form.title} className="w-full h-[400px] object-cover" onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
          {form.excerpt && <p className="text-lg text-gray-500 leading-relaxed mb-8 italic border-l-4 border-[#02028B]/20 pl-4">{form.excerpt}</p>}
          {form.content
            ? <div className="text-gray-600 leading-relaxed prose prose-lg max-w-none
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-2
                [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                [&_blockquote]:border-l-4 [&_blockquote]:border-[#02028B]/30 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-gray-500
                [&_a]:text-[#02028B] [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4"
              dangerouslySetInnerHTML={{ __html: form.content }} />
            : <p className="text-gray-300 text-lg italic">Content will appear here...</p>
          }
        </div>
      </div>
    </div>
  );
};

// ── Image Gallery Modal ────────────────────────────────────────────────────────

const ImageGalleryModal = ({ onSelect, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/images`, { withCredentials: true })
      .then(res => setImages(res.data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image permanently?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API}/api/images/${id}`, { withCredentials: true });
      setImages(imgs => imgs.filter(i => i.id !== id));
    } catch { alert('Failed to delete image.'); }
    finally { setDeleting(null); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(`${API}${url}`).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

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
              <div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
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
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-[#02028B] transition-all"
                  onClick={() => onSelect(`${API}${img.url}`)}>
                  <img src={`${API}${img.url}`} alt={img.filename}
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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editorError, setEditorError] = useState('');

  // Gallery modal
  const [galleryCallback, setGalleryCallback] = useState(null);

  // Contacts
  const [contacts, setContacts] = useState([]);
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

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBlogs = useCallback(async () => {
    setBlogsLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/blogs/all`, { withCredentials: true });
      setBlogs(data);
    } catch { showToast('Failed to load blogs', 'error'); }
    finally { setBlogsLoading(false); }
  }, []);

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/contact`, { withCredentials: true });
      setContacts(data);
    } catch { showToast('Failed to load contacts', 'error'); }
    finally { setContactsLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/admin/users`, { withCredentials: true });
      setAdminUsers(data);
    } catch { showToast('Failed to load users', 'error'); }
    finally { setUsersLoading(false); }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);
  useEffect(() => { if (activeTab === 'contacts' && contacts.length === 0) fetchContacts(); }, [activeTab, contacts.length, fetchContacts]);
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

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setEditorError(''); setShowEditor(true); };

  const openEdit = (blog) => {
    setForm({
      title: blog.title, slug: blog.slug, excerpt: blog.excerpt,
      content: blog.content, image_url: blog.image_url || '',
      author: blog.author, category: blog.category,
      tags: blog.tags || [], published: blog.published,
      meta_title: blog.meta_title || '', meta_description: blog.meta_description || ''
    });
    setEditingId(blog.id); setEditorError(''); setShowEditor(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) { setEditorError('Title, excerpt, and content are required.'); return; }
    setSaving(true); setEditorError('');
    try {
      if (editingId) {
        await axios.put(`${API}/api/blogs/${editingId}`, form, { withCredentials: true });
        showToast('Blog updated successfully');
      } else {
        await axios.post(`${API}/api/blogs`, form, { withCredentials: true });
        showToast('Blog created successfully');
      }
      setShowEditor(false); fetchBlogs();
    } catch (err) { setEditorError(err.response?.data?.detail || 'Failed to save blog'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    setDeleting(id);
    try { await axios.delete(`${API}/api/blogs/${id}`, { withCredentials: true }); showToast('Blog deleted'); fetchBlogs(); }
    catch { showToast('Failed to delete blog', 'error'); }
    finally { setDeleting(null); }
  };

  const togglePublish = async (blog) => {
    try {
      await axios.put(`${API}/api/blogs/${blog.id}`, { published: !blog.published }, { withCredentials: true });
      showToast(blog.published ? 'Blog unpublished' : 'Blog published'); fetchBlogs();
    } catch { showToast('Failed to update status', 'error'); }
  };

  // ── Admin Users ───────────────────────────────────────────────────────────

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserError('');
    if (newUser.password.length < 8) { setUserError('Password must be at least 8 characters'); return; }
    setAddingUser(true);
    try {
      await axios.post(`${API}/api/admin/users`, newUser, { withCredentials: true });
      showToast(`Admin "${newUser.name}" added`);
      setNewUser({ email: '', name: '', password: '' });
      setShowAddUser(false);
      fetchUsers();
    } catch (err) { setUserError(err.response?.data?.detail || 'Failed to add user'); }
    finally { setAddingUser(false); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Remove admin access for "${name}"?`)) return;
    setDeletingUser(id);
    try {
      await axios.delete(`${API}/api/admin/users/${id}`, { withCredentials: true });
      showToast(`${name} removed`); fetchUsers();
    } catch (err) { showToast(err.response?.data?.detail || 'Failed to remove user', 'error'); }
    finally { setDeletingUser(null); }
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
            <img src="/images/logo/sparkcurv1.png" alt="SparkCurv" className="h-8" style={{ mixBlendMode: 'multiply' }} />
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-700">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/blog" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#02028B] transition-colors">
              <BookOpen className="w-4 h-4" /><span className="hidden sm:inline">View Blog</span>
            </a>
            <a
              href={`${API}/api/blog-template/pdf`}
              download="sparkcurv-blog-template.pdf"
              data-testid="download-template-btn"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#02028B] transition-colors"
              title="Download Blog Template PDF"
            >
              <Download className="w-4 h-4" /><span className="hidden sm:inline">Template</span>
            </a>
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
            { label: 'Enquiries', value: contacts.length || '—', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                        <img src={blog.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block border border-gray-100" onError={e => { e.target.style.display = 'none'; }} />
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
          <ImageGalleryModal
            onSelect={null}
            onClose={() => setActiveTab('blogs')}
            asPage
          />
        )}

        {/* ── TEAM TAB ── */}
        {activeTab === 'team' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#02028B]" />
                <h2 className="text-base font-semibold text-gray-900">Admin Team</h2>
              </div>
              <button data-testid="add-admin-btn" onClick={() => { setShowAddUser(true); setUserError(''); }}
                className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <UserPlus className="w-4 h-4" />Add Admin
              </button>
            </div>

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
                    required placeholder="Password (min 8 chars)" className={inputCls} />
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

      {/* ── BLOG EDITOR MODAL ── */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div data-testid="blog-editor-modal" className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{editingId ? 'Edit Blog Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowEditor(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {editorError && (
                <div data-testid="editor-error" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{editorError}
                </div>
              )}

              {/* Post Details */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Post Details</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input data-testid="blog-title-input" type="text" value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                      placeholder="Enter blog post title" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Slug</label>
                    <input data-testid="blog-slug-input" type="text" value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="auto-generated-from-title" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select data-testid="blog-category-select" value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className={inputCls + ' bg-white'}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Author</label>
                    <input data-testid="blog-author-input" type="text" value={form.author}
                      onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                      placeholder="SparkCurv Team" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label>
                    <CoverImageUploader value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))}
                      onOpenGallery={(cb) => setGalleryCallback(() => cb)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                    <TagInput value={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
                    <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add each tag</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt <span className="text-red-500">*</span></label>
                    <textarea data-testid="blog-excerpt-input" value={form.excerpt}
                      onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} required rows={2}
                      placeholder="Brief summary shown in blog listing..." className={inputCls + ' resize-none'} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
                    <RichTextEditor value={form.content} onChange={content => setForm(f => ({ ...f, content }))}
                      placeholder="Write your blog content here..."
                      onOpenGallery={(insertFn) => setGalleryCallback(() => insertFn)} />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4 pt-2 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SEO Settings</p>
                  <span className="text-xs text-gray-400">(optional)</span>
                </div>
                <div className="grid sm:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                    <input data-testid="blog-meta-title-input" type="text" value={form.meta_title}
                      onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} maxLength={60}
                      placeholder="SEO title (max 60 chars)" className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">{form.meta_title.length}/60 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                    <textarea data-testid="blog-meta-desc-input" value={form.meta_description}
                      onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} maxLength={160} rows={2}
                      placeholder="SEO description (max 160 chars)" className={inputCls + ' resize-none'} />
                    <p className="text-xs text-gray-400 mt-1">{form.meta_description.length}/160 characters</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input data-testid="blog-published-checkbox" type="checkbox" checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#02028B] focus:ring-[#02028B]" />
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowPreview(true)} data-testid="preview-blog-btn"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />Preview
                  </button>
                  <button type="button" onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                  <button data-testid="save-blog-btn" type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                    {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4" />{editingId ? 'Update Post' : 'Create Post'}</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
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

      {/* Media tab inline gallery (just reuses same modal with no onSelect) */}
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
  const [deleting, setDeleting] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await axios.get(`${API}/api/images`, { withCredentials: true });
    setImages(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API}/api/images/${id}`, { withCredentials: true });
      setImages(imgs => imgs.filter(i => i.id !== id));
    } catch { alert('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(`${API}${url}`).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" /></div>;

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
            <img src={`${API}${img.url}`} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
