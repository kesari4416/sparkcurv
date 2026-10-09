import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  PlusCircle, Pencil, Trash2, LogOut, Eye, EyeOff,
  CheckCircle, XCircle, BookOpen, ChevronRight, X, Save,
  AlertCircle, Search, Filter, Mail, Phone, MessageSquare,
  Calendar, User, Tag, Globe
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['Technology', 'AI & Technology', 'DevOps', 'Mobile Development', 'Web Development', 'Cloud', 'Digital Marketing', 'Business'];

const emptyForm = {
  title: '', slug: '', excerpt: '', content: '',
  image_url: '', author: 'SparkCurv Team', category: 'Technology',
  published: true, meta_title: '', meta_description: ''
};

// ── Sub-components ────────────────────────────────────────────────────────────

const InputField = ({ label, required, testId, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all";

// ── Main Component ────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  // Tab
  const [activeTab, setActiveTab] = useState('blogs'); // 'blogs' | 'contacts'

  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editorError, setEditorError] = useState('');

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [expandedContact, setExpandedContact] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

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

  // ── Filtered lists ─────────────────────────────────────────────────────────

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || b.category === filterCategory;
      const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? b.published : !b.published);
      return matchSearch && matchCat && matchStatus;
    });
  }, [blogs, search, filterCategory, filterStatus]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.services?.toLowerCase().includes(q)
    );
  }, [contacts, contactSearch]);

  // ── Auth ───────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // ── Blog CRUD ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setEditorError('');
    setShowEditor(true);
  };

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
    } catch {
      showToast('Failed to delete blog', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (blog) => {
    try {
      await axios.put(`${API}/api/blogs/${blog.id}`, { published: !blog.published }, { withCredentials: true });
      showToast(blog.published ? 'Blog unpublished' : 'Blog published');
      fetchBlogs();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // ── Render ─────────────────────────────────────────────────────────────────

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
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">View Blog</span>
            </a>
            <span className="text-sm text-gray-500 hidden sm:block">{admin?.email}</span>
            <button data-testid="logout-btn" onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
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
          {[
            { id: 'blogs', label: 'Blog Posts', icon: BookOpen },
            { id: 'contacts', label: 'Contact Leads', icon: Mail },
          ].map(tab => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#02028B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BLOGS TAB ── */}
        {activeTab === 'blogs' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Blog Posts</h2>
                <button
                  data-testid="create-blog-btn"
                  onClick={openCreate}
                  className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Post
                </button>
              </div>

              {/* Search + Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    data-testid="blog-search-input"
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search posts..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all"
                  />
                </div>
                <select
                  data-testid="filter-category-select"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] bg-white transition-all"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  data-testid="filter-status-select"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] bg-white transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Results count */}
              {(search || filterCategory !== 'all' || filterStatus !== 'all') && (
                <p className="text-xs text-gray-400">{filteredBlogs.length} result{filteredBlogs.length !== 1 ? 's' : ''} found</p>
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
                {(search || filterCategory !== 'all' || filterStatus !== 'all') && (
                  <button onClick={() => { setSearch(''); setFilterCategory('all'); setFilterStatus('all'); }}
                    className="mt-2 text-[#02028B] text-sm hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredBlogs.map(blog => (
                  <div key={blog.id} data-testid={`blog-row-${blog.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    {blog.image_url && (
                      <img src={blog.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block border border-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h3>
                        <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${blog.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                        {blog.meta_title && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
                            <Globe className="w-3 h-3" /> SEO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{blog.excerpt}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{blog.category}</span>
                        <span>&bull;</span>
                        <span>{formatDate(blog.created_at)}</span>
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
                <button onClick={fetchContacts} className="text-sm text-[#02028B] hover:underline flex items-center gap-1">
                  Refresh
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  data-testid="contact-search-input"
                  type="text"
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  placeholder="Search by name, email, or service..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all"
                />
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
                    <div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedContact(expandedContact === contact.id ? null : contact.id)}
                    >
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
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedContact === contact.id ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedContact === contact.id && (
                      <div className="mt-4 ml-14 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">WhatsApp</p>
                            <a href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-[#02028B] hover:underline">{contact.whatsapp || '—'}</a>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                            <a href={`mailto:${contact.email}`} className="text-sm text-[#02028B] hover:underline">{contact.email}</a>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Message / Description</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{contact.description || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={`mailto:${contact.email}`}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-[#02028B] text-white rounded-lg hover:bg-[#0303b5] transition-colors">
                            <Mail className="w-3.5 h-3.5" /> Reply via Email
                          </a>
                          {contact.whatsapp && (
                            <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
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

              {/* ── Basic Info ── */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Post Details</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <InputField label="Title" required>
                      <input data-testid="blog-title-input" type="text" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        required placeholder="Enter blog post title" className={inputCls} />
                    </InputField>
                  </div>
                  <InputField label="URL Slug">
                    <input data-testid="blog-slug-input" type="text" value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="auto-generated-from-title" className={inputCls} />
                  </InputField>
                  <InputField label="Category">
                    <select data-testid="blog-category-select" value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className={inputCls + ' bg-white'}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </InputField>
                  <InputField label="Author">
                    <input data-testid="blog-author-input" type="text" value={form.author}
                      onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                      placeholder="SparkCurv Team" className={inputCls} />
                  </InputField>
                  <InputField label="Cover Image URL">
                    <input data-testid="blog-image-input" type="url" value={form.image_url}
                      onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg" className={inputCls} />
                  </InputField>
                  <div className="sm:col-span-2">
                    <InputField label="Excerpt" required>
                      <textarea data-testid="blog-excerpt-input" value={form.excerpt}
                        onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                        required rows={2} placeholder="Brief summary shown in blog listing..."
                        className={inputCls + ' resize-none'} />
                    </InputField>
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Content" required>
                      <RichTextEditor value={form.content}
                        onChange={content => setForm(f => ({ ...f, content }))}
                        placeholder="Write your blog content here..." />
                    </InputField>
                  </div>
                </div>
              </div>

              {/* ── SEO Section ── */}
              <div className="space-y-4 pt-2 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SEO Settings</p>
                  <span className="text-xs text-gray-400">(optional — overrides title & description in search results)</span>
                </div>
                <div className="grid sm:grid-cols-1 gap-4">
                  <InputField label="Meta Title">
                    <input data-testid="blog-meta-title-input" type="text" value={form.meta_title}
                      onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                      maxLength={60}
                      placeholder="SEO title (max 60 chars) — leave blank to use post title"
                      className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">{form.meta_title.length}/60 characters</p>
                  </InputField>
                  <InputField label="Meta Description">
                    <textarea data-testid="blog-meta-desc-input" value={form.meta_description}
                      onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                      maxLength={160} rows={2}
                      placeholder="SEO description (max 160 chars) — leave blank to use excerpt"
                      className={inputCls + ' resize-none'} />
                    <p className="text-xs text-gray-400 mt-1">{form.meta_description.length}/160 characters</p>
                  </InputField>
                </div>
              </div>

              {/* ── Publish & Actions ── */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input data-testid="blog-published-checkbox" type="checkbox" checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#02028B] focus:ring-[#02028B]" />
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowEditor(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Cancel
                  </button>
                  <button data-testid="save-blog-btn" type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" />{editingId ? 'Update Post' : 'Create Post'}</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
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

export default AdminDashboard;
