import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  PlusCircle, Pencil, Trash2, LogOut, Eye, EyeOff,
  CheckCircle, XCircle, BookOpen, ChevronRight, X, Save,
  AlertCircle, Search, Mail, Phone, MessageSquare,
  Tag, Globe, Upload, ImageIcon, User, Calendar
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['Technology', 'AI & Technology', 'DevOps', 'Mobile Development', 'Web Development', 'Cloud', 'Digital Marketing', 'Business'];

const emptyForm = {
  title: '', slug: '', excerpt: '', content: '',
  image_url: '', author: 'SparkCurv Team', category: 'Technology',
  published: true, meta_title: '', meta_description: ''
};

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all";

// ── Cover Image Uploader ──────────────────────────────────────────────────────

const CoverImageUploader = ({ value, onChange }) => {
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
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(`${API}${data.url}`);
    } catch {
      alert('Upload failed. Please try again or paste a URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  if (value && !urlMode) {
    return (
      <div className="relative group">
        <img
          src={value}
          alt="Cover"
          data-testid="cover-image-preview"
          className="w-full h-40 object-cover rounded-lg border border-gray-200"
          onError={() => onChange('')}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-50">
            <Upload className="w-3.5 h-3.5" /> Replace
          </button>
          <button type="button" onClick={() => onChange('')}
            className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-red-600">
            <X className="w-3.5 h-3.5" /> Remove
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
          <input
            data-testid="blog-image-url-input"
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className={inputCls + ' flex-1'}
          />
          <button type="button" onClick={() => setUrlMode(false)}
            className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          data-testid="cover-image-upload-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 w-full h-36 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:border-[#02028B]/40 hover:bg-blue-50/30 transition-all cursor-pointer"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">Click or drag image here</p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP — max 5 MB</p>
            </>
          )}
        </div>
      )}
      <button type="button" onClick={() => setUrlMode(v => !v)}
        className="text-xs text-[#02028B] hover:underline">
        {urlMode ? 'Upload a file instead' : 'Paste an image URL instead'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        data-testid="cover-image-file-input"
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
};

// ── Blog Preview Modal ────────────────────────────────────────────────────────

const BlogPreviewModal = ({ form, onClose }) => {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      data-testid="blog-preview-modal"
      className="fixed inset-0 z-[60] bg-black/60 flex flex-col overflow-hidden"
    >
      {/* Preview bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#02028B]" />
          <span className="text-sm font-semibold text-gray-800">Post Preview</span>
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Not yet saved</span>
        </div>
        <button
          data-testid="close-preview-btn"
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" /> Close Preview
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="pt-10 pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            {/* Category */}
            <span className="inline-block px-4 py-1 bg-blue-50 border border-blue-200 text-[#02028B] text-xs uppercase tracking-wider rounded-sm mb-6">
              {form.category || 'Technology'}
            </span>

            {/* Title */}
            <h1 className="font-clash text-4xl sm:text-5xl font-semibold tracking-tighter mb-6 text-gray-900 leading-tight">
              {form.title || <span className="text-gray-300">Untitled Post</span>}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-gray-500 mb-10">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="text-sm">{form.author || 'SparkCurv Team'}</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">{formatDate(new Date())}</span>
              </span>
            </div>

            {/* Cover image */}
            {form.image_url && (
              <div className="mb-12 rounded-lg overflow-hidden border border-gray-200">
                <img src={form.image_url} alt={form.title} className="w-full h-[400px] object-cover"
                  onError={e => { e.target.style.display = 'none'; }} />
              </div>
            )}

            {/* Excerpt */}
            {form.excerpt && (
              <p className="text-lg text-gray-500 leading-relaxed mb-8 italic border-l-4 border-[#02028B]/20 pl-4">{form.excerpt}</p>
            )}

            {/* Content */}
            {form.content ? (
              <div
                className="text-gray-600 leading-relaxed prose prose-lg max-w-none
                  [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-8
                  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h2]:mt-6
                  [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-2 [&_h3]:mt-5
                  [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#02028B]/30 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-6
                  [&_a]:text-[#02028B] [&_a]:underline
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
                  [&_strong]:font-semibold [&_strong]:text-gray-800"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            ) : (
              <p className="text-gray-300 text-lg italic">Content will appear here...</p>
            )}
          </div>
        </div>
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

  // Contacts
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [expandedContact, setExpandedContact] = useState(null);

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
    } catch {
      showToast('Failed to load blogs', 'error');
    } finally {
      setBlogsLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/contact`, { withCredentials: true });
      setContacts(data);
    } catch {
      showToast('Failed to load contacts', 'error');
    } finally {
      setContactsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);
  useEffect(() => {
    if (activeTab === 'contacts' && contacts.length === 0) fetchContacts();
  }, [activeTab, fetchContacts, contacts.length]);

  // ── Filtered lists ────────────────────────────────────────────────────────

  const filteredBlogs = useMemo(() => blogs.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || b.category === filterCategory;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? b.published : !b.published);
    return matchSearch && matchCat && matchStatus;
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
      author: blog.author, category: blog.category, published: blog.published,
      meta_title: blog.meta_title || '', meta_description: blog.meta_description || ''
    });
    setEditingId(blog.id);
    setEditorError('');
    setShowEditor(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setEditorError('Title, excerpt, and content are required.');
      return;
    }
    setSaving(true);
    setEditorError('');
    try {
      if (editingId) {
        await axios.put(`${API}/api/blogs/${editingId}`, form, { withCredentials: true });
        showToast('Blog updated successfully');
      } else {
        await axios.post(`${API}/api/blogs`, form, { withCredentials: true });
        showToast('Blog created successfully');
      }
      setShowEditor(false);
      fetchBlogs();
    } catch (err) {
      setEditorError(err.response?.data?.detail || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API}/api/blogs/${id}`, { withCredentials: true });
      showToast('Blog deleted');
      fetchBlogs();
    } catch { showToast('Failed to delete blog', 'error'); }
    finally { setDeleting(null); }
  };

  const togglePublish = async (blog) => {
    try {
      await axios.put(`${API}/api/blogs/${blog.id}`, { published: !blog.published }, { withCredentials: true });
      showToast(blog.published ? 'Blog unpublished' : 'Blog published');
      fetchBlogs();
    } catch { showToast('Failed to update status', 'error'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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
          {[{ id: 'blogs', label: 'Blog Posts', icon: BookOpen }, { id: 'contacts', label: 'Contact Leads', icon: Mail }].map(tab => (
            <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#02028B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
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
                    placeholder="Search posts..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all" />
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

            {blogsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{blogs.length === 0 ? 'No blog posts yet. Create your first one!' : 'No posts match your search.'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredBlogs.map(blog => (
                  <div key={blog.id} data-testid={`blog-row-${blog.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    {blog.image_url && (
                      <img src={blog.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block border border-gray-100"
                        onError={e => { e.target.style.display = 'none'; }} />
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
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{blog.category}</span><span>&bull;</span><span>{formatDate(blog.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button data-testid={`toggle-publish-${blog.id}`} onClick={() => togglePublish(blog)}
                        title={blog.published ? 'Unpublish' : 'Publish'}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#02028B] hover:bg-blue-50 transition-colors">
                        {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button data-testid={`edit-blog-${blog.id}`} onClick={() => openEdit(blog)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#02028B] hover:bg-blue-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button data-testid={`delete-blog-${blog.id}`} onClick={() => handleDelete(blog.id)}
                        disabled={deleting === blog.id}
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
            {contactsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{contacts.length === 0 ? 'No enquiries received yet.' : 'No contacts match your search.'}</p>
              </div>
            ) : (
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
                      <button className="p-1.5 text-gray-400 flex-shrink-0">
                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedContact === contact.id ? 'rotate-90' : ''}`} />
                      </button>
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
      </main>

      {/* ── BLOG EDITOR MODAL ── */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div data-testid="blog-editor-modal" className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{editingId ? 'Edit Blog Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowEditor(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
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
                    <CoverImageUploader
                      value={form.image_url}
                      onChange={url => setForm(f => ({ ...f, image_url: url }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt <span className="text-red-500">*</span></label>
                    <textarea data-testid="blog-excerpt-input" value={form.excerpt}
                      onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} required rows={2}
                      placeholder="Brief summary shown in blog listing..."
                      className={inputCls + ' resize-none'} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
                    <RichTextEditor value={form.content}
                      onChange={content => setForm(f => ({ ...f, content }))}
                      placeholder="Write your blog content here..." />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
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

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input data-testid="blog-published-checkbox" type="checkbox" checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#02028B] focus:ring-[#02028B]" />
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowPreview(true)}
                    data-testid="preview-blog-btn"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />Preview
                  </button>
                  <button type="button" onClick={() => setShowEditor(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Cancel
                  </button>
                  <button data-testid="save-blog-btn" type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                      : <><Save className="w-4 h-4" />{editingId ? 'Update Post' : 'Create Post'}</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {showPreview && <BlogPreviewModal form={form} onClose={() => setShowPreview(false)} />}

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

export default AdminDashboard;
