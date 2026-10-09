import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import SEO from '../components/SEO';

const API = process.env.REACT_APP_BACKEND_URL;

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/blogs/${slug}`)
      .then(res => setPost(res.data))
      .catch(() => setError('Blog post not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="inline-block w-12 h-12 border-4 border-[#02028B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20" data-testid="blog-post-error">
        <h2 className="text-3xl font-clash font-semibold mb-4">Blog Post Not Found</h2>
        <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="bg-[#02028B] text-white hover:bg-[#0303A8] transition-colors rounded-full px-6 py-3 font-medium inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" /><span>Back to Blog</span>
        </Link>
      </div>
    );
  }

  const seoTitle = post.meta_title || post.title;
  const seoDesc = post.meta_description || post.excerpt;

  return (
    <div data-testid="blog-post-page" className="pt-20">
      <SEO title={seoTitle} description={seoDesc} canonical={`https://sparkcurv.com/blog/${post.slug}`} />
      <article className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <Link to="/blog" data-testid="back-to-blog"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-[#02028B] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /><span>Back to Blog</span>
          </Link>

          <div className="mb-8">
            <span className="inline-block px-4 py-1 bg-blue-50 border border-blue-200 text-[#02028B] text-xs uppercase tracking-wider rounded-sm mb-6">
              {post.category}
            </span>
            <h1 className="font-clash text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter mb-6">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-500">
              <span className="flex items-center space-x-2"><User className="w-5 h-5" /><span>{post.author}</span></span>
              <span className="flex items-center space-x-2"><Calendar className="w-5 h-5" /><span>{formatDate(post.created_at)}</span></span>
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div data-testid="blog-post-tags" className="flex flex-wrap gap-2 mt-5">
                {post.tags.map(tag => (
                  <Link key={tag} to={`/blog?tag=${tag}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-[#02028B] text-xs font-medium rounded-full hover:bg-blue-100 transition-colors">
                    <Tag className="w-3 h-3" />{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {post.image_url && (
            <div className="mb-12 rounded-sm overflow-hidden border border-gray-200">
              <img src={post.image_url} alt={post.title} className="w-full h-[500px] object-cover" />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
