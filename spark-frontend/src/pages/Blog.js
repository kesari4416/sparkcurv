import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

// WordPress REST API URL - configure this to your WordPress installation
const WP_API = process.env.REACT_APP_WP_URL
  ? `${process.env.REACT_APP_WP_URL}/wp-json/wp/v2`
  : null;

// Fallback blog posts when WordPress is not connected
const fallbackPosts = [
  {
    id: 1,
    slug: 'future-of-ai-in-business',
    title: 'The Future of AI in Business: Transforming Industries',
    excerpt: 'Explore how artificial intelligence is revolutionizing business operations, from automation to predictive analytics, and what it means for the future of work.',
    content: '',
    image_url: '/images/blog/ai-ml.jpg',
    author: 'SparkCurv Team',
    category: 'AI & Technology',
    created_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 2,
    slug: 'devops-best-practices-2025',
    title: 'DevOps Best Practices for 2025: Building Resilient Systems',
    excerpt: 'Discover the latest DevOps strategies and tools that are helping teams deploy faster, reduce downtime, and build more resilient infrastructure.',
    content: '',
    image_url: '/images/blog/devops.jpg',
    author: 'DevOps Team',
    category: 'DevOps',
    created_at: '2025-01-20T00:00:00Z',
  },
  {
    id: 3,
    slug: 'mobile-app-development-trends-2025',
    title: 'Mobile App Development Trends: What Users Expect in 2025',
    excerpt: 'User expectations for mobile apps have never been higher. Learn about the trends shaping mobile development and how to build apps that users love.',
    content: '',
    image_url: '/images/blog/mobile-app.jpg',
    author: 'Mobile Team',
    category: 'Mobile Development',
    created_at: '2025-01-25T00:00:00Z',
  },
];

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      if (WP_API) {
        // Fetch from WordPress REST API
        const response = await axios.get(`${WP_API}/posts?_embed&per_page=20`);
        const wpPosts = response.data.map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title.rendered,
          excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').trim(),
          content: post.content.rendered,
          image_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/blog/ai-ml.jpg',
          author: post._embedded?.author?.[0]?.name || 'SparkCurv Team',
          category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Technology',
          created_at: post.date,
        }));
        setPosts(wpPosts);
      } else {
        // Use fallback posts
        setPosts(fallbackPosts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div data-testid="blog-page" className="pt-20">
      <SEO
  title="Technology Blog | AI, Cloud, Software Development & Digital Marketing | SparkCurv"
  description="Read the latest insights from SparkCurv on AI, cloud computing, software development, web and mobile app development, digital marketing, DevOps, and emerging technology trends."
  keywords="technology blog, AI blog, cloud computing blog, software development blog, web development articles, mobile app development blog, digital marketing insights, DevOps articles, technology trends, SparkCurv blog"
  canonical="https://sparkcurv.com/blog"
/>
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">
              Our Blog
            </p>
            <h1 className="font-clash text-5xl sm:text-6xl font-semibold tracking-tighter mb-6">
              Latest Insights
            </h1>
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
                  <div className="overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
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
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
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
