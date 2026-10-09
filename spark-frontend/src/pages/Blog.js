import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const API = process.env.REACT_APP_BACKEND_URL;

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/blogs`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Our Blog</p>
            <h1 className="font-clash text-5xl sm:text-6xl font-semibold tracking-tighter mb-6">Latest Insights</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover the latest trends, insights, and best practices in technology and digital transformation.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#02028B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  data-testid={`blog-card-${post.slug}`}
                  className={`bg-gray-50 border border-gray-200 rounded-sm overflow-hidden hover:border-gray-400 transition-all duration-300 group reveal-on-scroll delay-${(index % 3) + 1}`}
                >
                  {post.image_url && (
                    <div className="overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.created_at)}</span>
                      </span>
                    </div>
                    <h3 className="font-clash text-2xl font-medium mb-3 group-hover:text-[#02028B] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
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
