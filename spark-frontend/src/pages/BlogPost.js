import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const WP_API = process.env.REACT_APP_WP_URL
  ? `${process.env.REACT_APP_WP_URL}/wp-json/wp/v2`
  : null;

// Fallback blog post data
const fallbackPosts = {
  'future-of-ai-in-business': {
    title: 'The Future of AI in Business: Transforming Industries',
    content: `Artificial Intelligence is no longer a futuristic concept — it's here, and it's transforming how businesses operate across every industry. From healthcare to finance, retail to manufacturing, AI is enabling companies to automate processes, gain deeper insights, and make smarter decisions.\n\nMachine learning algorithms can now predict customer behavior with remarkable accuracy, allowing businesses to personalize experiences at scale. Natural language processing is making customer service more efficient through intelligent chatbots and virtual assistants.\n\nBut AI isn't just about automation. It's about augmentation — enhancing human capabilities and freeing up time for strategic thinking and creativity. The businesses that will thrive in the coming years are those that embrace AI not as a replacement for human workers, but as a powerful tool to amplify their potential.\n\nAt SparkCurv, we're helping businesses navigate this AI revolution, implementing practical solutions that deliver real ROI. Whether it's predictive maintenance, demand forecasting, or intelligent automation, we're turning AI potential into business reality.`,
    image_url: '/images/blog/ai-ml.jpg',
    author: 'SparkCurv Team',
    category: 'AI & Technology',
    created_at: '2025-01-15T00:00:00Z',
  },
  'devops-best-practices-2025': {
    title: 'DevOps Best Practices for 2025: Building Resilient Systems',
    content: `DevOps has evolved from a buzzword to a critical business practice. In 2025, the most successful organizations are those that have mastered the art of continuous delivery, infrastructure automation, and proactive monitoring.\n\nKey practices that define modern DevOps include Infrastructure as Code (IaC), which allows teams to version and deploy infrastructure with the same rigor as application code. Container orchestration with Kubernetes has become the standard for managing microservices at scale.\n\nObservability is no longer optional — it's essential. Modern monitoring solutions go beyond traditional metrics to provide deep insights into system behavior, enabling teams to identify and resolve issues before they impact users.\n\nSecurity has shifted left in the development process, with DevSecOps practices ensuring that security is baked into every stage of the pipeline rather than being an afterthought.\n\nAt SparkCurv, we implement these best practices for our clients, building CI/CD pipelines that enable rapid iteration while maintaining stability and security. Our 24/7 monitoring ensures that issues are detected and resolved before they become problems.`,
    image_url: '/images/blog/devops.jpg',
    author: 'DevOps Team',
    category: 'DevOps',
    created_at: '2025-01-20T00:00:00Z',
  },
  'mobile-app-development-trends-2025': {
    title: 'Mobile App Development Trends: What Users Expect in 2025',
    content: `The mobile app landscape is more competitive than ever. Users expect apps to be fast, intuitive, and seamlessly integrated with their digital ecosystem. Meeting these expectations requires staying ahead of the latest trends and technologies.\n\nProgressive Web Apps (PWAs) are blurring the line between web and native apps, offering app-like experiences that work across all devices. Cross-platform frameworks like React Native and Flutter are enabling developers to build for iOS and Android simultaneously without sacrificing performance.\n\n5G networks are enabling new categories of mobile experiences, from augmented reality to real-time collaboration tools. Apps that leverage these capabilities are providing users with experiences that were impossible just a few years ago.\n\nPrivacy and security have become paramount. Users are increasingly aware of how their data is used, and apps that prioritize privacy and transparency are earning user trust and loyalty.\n\nAt SparkCurv, we build mobile apps that don't just meet current standards — they set them. Our focus on performance, user experience, and security ensures that the apps we create are built to succeed in today's demanding market.`,
    image_url: '/images/blog/mobile-app.jpg',
    author: 'Mobile Team',
    category: 'Mobile Development',
    created_at: '2025-01-25T00:00:00Z',
  },
};

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      if (WP_API) {
        // Fetch from WordPress REST API
        const response = await axios.get(`${WP_API}/posts?slug=${slug}&_embed`);
        if (response.data.length > 0) {
          const wp = response.data[0];
          setPost({
            title: wp.title.rendered,
            content: wp.content.rendered,
            image_url: wp._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
            author: wp._embedded?.author?.[0]?.name || 'SparkCurv Team',
            category: wp._embedded?.['wp:term']?.[0]?.[0]?.name || 'Technology',
            created_at: wp.date,
          });
        } else {
          setError('Blog post not found');
        }
      } else {
        // Use fallback data
        const fallback = fallbackPosts[slug];
        if (fallback) {
          setPost(fallback);
        } else {
          setError('Blog post not found');
        }
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
      // Try fallback
      const fallback = fallbackPosts[slug];
      if (fallback) {
        setPost(fallback);
      } else {
        setError('Blog post not found');
      }
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
        <Link
          to="/blog"
          className="bg-[#02028B] text-white hover:bg-[#0303A8] transition-colors rounded-full px-6 py-3 font-medium inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="blog-post-page" className="pt-20">
      <article className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <Link
            to="/blog"
            data-testid="back-to-blog"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-[#02028B] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>

          <div className="mb-8">
            <span className="inline-block px-4 py-1 bg-blue-50 border border-blue-200 text-[#02028B] text-xs uppercase tracking-wider rounded-sm mb-6">
              {post.category}
            </span>
            <h1 className="font-clash text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter mb-6">
              {post.title}
            </h1>
            <div className="flex items-center space-x-6 text-gray-500">
              <span className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </span>
              <span className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.created_at)}</span>
              </span>
            </div>
          </div>

          {post.image_url && (
            <div className="mb-12 rounded-sm overflow-hidden border border-gray-200">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-[500px] object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-600 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
