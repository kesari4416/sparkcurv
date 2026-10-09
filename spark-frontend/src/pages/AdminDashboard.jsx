import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  PlusCircle, Pencil, Trash2, LogOut, Eye, EyeOff,
  CheckCircle, XCircle, BookOpen, ChevronRight, X, Save, AlertCircle
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['Technology', 'AI & Technology', 'DevOps', 'Mobile Development', 'Web Development', 'Cloud', 'Digital Marketing', 'Business'];

const emptyForm = {
  title: '', slug: '', excerpt: '', content: '',
  image_url: '', author: 'SparkCurv Team', category: 'Technology', published: true
};

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBlogs = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/blogs/all`, { withCredentials: true });
      setBlogs(data);
    } catch {
      showToast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowEditor(true);
  };

  const openEdit = (blog) => {
    setForm({
      title: blog.title, slug: blog.slug, excerpt: blog.excerpt,
      content: blog.content, image_url: blog.image_url || '',
      author: blog.author, category: blog.category, published: blog.published
    });
    setEditingId(blog.id);
    setError('');
    setShowEditor(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError('Title, excerpt, and content are required.');
      return;
    }
    setSaving(true);
    setError('');
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
      setError(err.response?.data?.detail || 'Failed to save blog');
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
            <button
              data-testid="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Posts', value: blogs.length, icon: BookOpen, color: 'text-[#02028B]', bg: 'bg-blue-50' },
            { label: 'Published', value: blogs.filter(b => b.published).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Draft', value: blogs.filter(b => !b.published).length, icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
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

        {/* Blogs List */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Blog Posts</h2>
            <button
              data-testid="create-blog-btn"
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              New Post
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No blog posts yet. Create your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {blogs.map(blog => (
                <div key={blog.id} data-testid={`blog-row-${blog.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {blog.image_url && (
                    <img src={blog.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block border border-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h3>
                      <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${blog.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{blog.excerpt}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{blog.category}</span>
                      <span>&bull;</span>
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      data-testid={`toggle-publish-${blog.id}`}
                      onClick={() => togglePublish(blog)}
                      title={blog.published ? 'Unpublish' : 'Publish'}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#02028B] hover:bg-blue-50 transition-colors"
                    >
                      {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      data-testid={`edit-blog-${blog.id}`}
                      onClick={() => openEdit(blog)}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#02028B] hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      data-testid={`delete-blog-${blog.id}`}
                      onClick={() => handleDelete(blog.id)}
                      disabled={deleting === blog.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {blog.published && (
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Blog Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div data-testid="blog-editor-modal" className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? 'Edit Blog Post' : 'New Blog Post'}
              </h2>
              <button onClick={() => setShowEditor(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div data-testid="editor-error" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input
                    data-testid="blog-title-input"
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                    placeholder="Enter blog post title"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Slug</label>
                  <input
                    data-testid="blog-slug-input"
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated-from-title"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    data-testid="blog-category-select"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Author</label>
                  <input
                    data-testid="blog-author-input"
                    type="text"
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    placeholder="SparkCurv Team"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image URL</label>
                  <input
                    data-testid="blog-image-input"
                    type="url"
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt <span className="text-red-500">*</span></label>
                  <textarea
                    data-testid="blog-excerpt-input"
                    value={form.excerpt}
                    onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                    required
                    rows={2}
                    placeholder="Brief summary of the blog post (shown in blog listing)..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02028B]/30 focus:border-[#02028B] transition-all resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
                  <RichTextEditor
                    value={form.content}
                    onChange={content => setForm(f => ({ ...f, content }))}
                    placeholder="Write your blog content here..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      data-testid="blog-published-checkbox"
                      type="checkbox"
                      checked={form.published}
                      onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-[#02028B] focus:ring-[#02028B]"
                    />
                    <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Cancel
                </button>
                <button
                  data-testid="save-blog-btn"
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#02028B] hover:bg-[#0303b5] disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingId ? 'Update Post' : 'Create Post'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div data-testid="toast-notification" className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
