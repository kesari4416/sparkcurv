import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowRight, Tag, X } from 'lucide-react';
import SEO from '../components/SEO';

const API = process.env.REACT_APP_BACKEND_URL;

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/blogs`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Collect all unique tags across all posts
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))].sort();

  const displayed = activeTag ? posts.filter(p => (p.tags || []).includes(activeTag)) : posts;

  return (
    <div data-testid="blog-page" className="pt-20">
      <SEO
        title="Technology Blog | AI, Cloud, Software Development & Digital Marketing | SparkCurv"
        description="Read the latest insights from SparkCurv on AI, cloud computing, software development, web and mobile app development, digital marketing, DevOps, and emerging technology trends."
        keywords="technology blog, AI blog, cloud computing blog, software development blog, SparkCurv blog"
        canonical="https://sparkcurv.com/blog"
      />
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Our Blog</p>
            <h1 className="font-clash text-5xl sm:text-6xl font-semibold tracking-tighter mb-6">Latest Insights</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover the latest trends, insights, and best practices in technology and digital transformation.
            </p>
          </div>

          {/* Tag filter bar */}
          {allTags.length > 0 && (
            <div data-testid="tag-filter-bar" className="flex flex-wrap items-center justify-center gap-2 mb-12">
              <button
                data-testid="tag-filter-all"
                onClick={() => setActiveTag('')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!activeTag ? 'bg-[#02028B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All Posts
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  data-testid={`tag-filter-${tag}`}
                  onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTag === tag ? 'bg-[#02028B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </button>
              ))}
              {activeTag && (
                <button onClick={() => setActiveTag('')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 ml-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#02028B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                {activeTag ? `No posts tagged "${activeTag}".` : 'No blog posts available yet. Check back soon!'}
              </p>
              {activeTag && (
                <button onClick={() => setActiveTag('')} className="mt-4 text-[#02028B] text-sm hover:underline">View all posts</button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayed.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  data-testid={`blog-card-${post.slug}`}
                  className={`bg-gray-50 border border-gray-200 rounded-sm overflow-hidden hover:border-gray-400 transition-all duration-300 group reveal-on-scroll delay-${(index % 3) + 1}`}
                >
                  {post.image_url && (
                    <div className="overflow-hidden">
                      <img src={post.image_url} alt={post.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" /><span>{post.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" /><span>{formatDate(post.created_at)}</span>
                      </span>
                    </div>
                    <h3 className="font-clash text-2xl font-medium mb-3 group-hover:text-[#02028B] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} onClick={(e) => { e.preventDefault(); setActiveTag(tag); }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#02028B] text-xs rounded-full hover:bg-blue-100 transition-colors cursor-pointer">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center text-[#02028B] text-sm font-medium">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
