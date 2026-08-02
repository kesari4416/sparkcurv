import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import FAQSection from '../components/FAQSection';
import SEO from '../components/SEO';
const servicesData = {
  'ai-ml': {
    title: 'AI & ML Services',
    subtitle: 'Intelligent Automation for Modern Business',
    description: 'Harness the power of artificial intelligence and machine learning to automate processes, gain predictive insights, and make data-driven decisions that drive growth.',
    image: '/images/services/ai-ml-hero.jpg',
    features: [
      'Machine Learning Model Development',
      'Natural Language Processing',
      'Computer Vision Solutions',
      'Predictive Analytics',
      'AI-Powered Automation',
      'Deep Learning Applications',
    ],
    seo: {
    title: 'AI & ML Services | Machine Learning & AI Solutions | SparkCurv',
    description:
      'Transform your business with SparkCurv AI & ML Services. We build machine learning models, NLP solutions, computer vision systems, predictive analytics, and AI-powered automation.',
    keywords:
      'AI services, machine learning, NLP, computer vision, predictive analytics',
    canonical: 'https://sparkcurv.com/ai-ml',
  },
    tools: [
      { name: 'TensorFlow', logo: '/images/tools/tensorflow.png' },
      { name: 'PyTorch', logo: '/images/tools/pytorch.png' },
      { name: 'Scikit-learn', logo: '/images/tools/scikit-learn.svg' },
      { name: 'Keras', logo: '/images/tools/keras.svg' },
      { name: 'OpenAI', logo: '/images/tools/openai.svg' },
      { name: 'Hugging Face', logo: '/images/tools/huggingface.svg' },
      { name: 'Pandas', logo: '/images/tools/pandas.svg' },
      { name: 'NumPy', logo: '/images/tools/numpy.svg' },
      { name: 'Jupyter', logo: '/images/tools/jupyter.svg' },
      { name: 'Python', logo: '/images/tools/python.svg' },
      { name: 'NVIDIA', logo: '/images/tools/nvidia.png' },
      { name: 'Google Colab', logo: '/images/tools/colab.png' },
    ],
    faqs: [
      { question: 'What types of AI & ML solutions do you build?', answer: 'We develop a wide range of AI solutions including predictive analytics models, natural language processing systems, computer vision applications, recommendation engines, chatbots, and custom deep learning models tailored to your specific business use case.' },
      { question: 'How long does it take to develop an AI/ML model?', answer: 'Timelines vary based on complexity. A proof of concept typically takes 2-4 weeks, while a full production-grade model can take 2-6 months including data preparation, training, testing, and deployment. We follow an iterative approach to deliver results quickly.' },
      { question: 'Do I need a large dataset to get started with AI?', answer: 'Not necessarily. While large datasets improve model accuracy, we can work with smaller datasets using techniques like transfer learning, data augmentation, and synthetic data generation. We assess your data readiness as part of our initial consultation.' },
      { question: 'Can you integrate AI into our existing applications?', answer: 'Absolutely. We specialize in integrating AI capabilities into existing systems through APIs and microservices. Whether it is adding a recommendation engine to your e-commerce site or NLP to your customer support platform, we ensure seamless integration.' },
      { question: 'What cloud platforms do you use for AI deployment?', answer: 'We deploy AI models on all major cloud platforms including AWS (SageMaker), Google Cloud (Vertex AI), and Azure (Azure ML). We also support on-premise and hybrid deployments based on your security and compliance requirements.' },
    ],
  },
  'devops': {
    title: 'DevOps Services',
    subtitle: '24/7 Infrastructure Management & Automation',
    description: 'Optimize your development pipeline with cutting-edge DevOps practices. We provide round-the-clock monitoring, CI/CD automation, and infrastructure management to ensure seamless operations.',
    image: '/images/services/devops-hero.png',
    features: [
      '24/7 Monitoring & Support',
      'CI/CD Pipeline Automation',
      'Infrastructure as Code',
      'Container Orchestration (Kubernetes)',
      'Cloud Migration & Management',
      'Security & Compliance',
    ],
    tools: [
      { name: 'Docker', logo: '/images/tools/docker.png' },
      { name: 'Kubernetes', logo: '/images/tools/kubernetes.png' },
      { name: 'Jenkins', logo: '/images/tools/jenkins.svg' },
      { name: 'GitHub Actions', logo: '/images/tools/github-actions.svg' },
      { name: 'Terraform', logo: '/images/tools/terraform.svg' },
      { name: 'AWS', logo: '/images/tools/aws.svg' },
      { name: 'Azure', logo: '/images/tools/Azure1.png' },
      { name: 'Ansible', logo: '/images/tools/ansible.png' },
      { name: 'Prometheus', logo: '/images/tools/prometheus.svg' },
      { name: 'Grafana', logo: '/images/tools/grafana.svg' },
      { name: 'GitLab', logo: '/images/tools/gitlab.svg' },
      { name: 'Nginx', logo: '/images/tools/nginx.svg' },
    ],
    seo: {
    title: 'Cloud Services | AWS, Azure, GCP, DevOps & Infrastructure Management | SparkCurv',
    description:
      'SparkCurv provides managed cloud services including AWS, Azure, GCP infrastructure management, CI/CD automation, Kubernetes, Docker, monitoring, database administration, security, compliance, and cloud migration support.',
    keywords:
      'cloud services,managed cloud services,AWS services,Azure services,GCP services,DevOps services,cloud infrastructure management,cloud migration services,Kubernetes services,Docker services,CI/CD automation,infrastructure management,cloud consulting,DevOps consulting,cloud monitoring services',
    canonical: 'https://sparkcurv.com/managed-cloud-service',
  },
  },
  'mobile-app': {
    title: 'Mobile App Development',
    subtitle: 'Native & Cross-Platform Mobile Solutions',
    description: 'Build stunning, high-performance mobile applications for iOS and Android. We create user-centric apps that deliver exceptional experiences and drive engagement.',
    image: '/images/services/mobile-app-hero.jpg',
    features: [
      'iOS App Development',
      'Android App Development',
      'React Native / Flutter',
      'UI/UX Design',
      'App Store Optimization',
      'Maintenance & Support',
    ],
    tools: [
      { name: 'React Native', logo: '/images/tools/react-native.svg' },
      { name: 'Flutter', logo: '/images/tools/flutter.png' },
      { name: 'Swift', logo: '/images/tools/swift.png' },
      { name: 'Kotlin', logo: '/images/tools/kotlin.png' },
      { name: 'Android Studio', logo: '/images/tools/android-studio.svg' },
      { name: 'Xcode', logo: '/images/tools/xcode.png' },
      { name: 'Firebase', logo: '/images/tools/firebase.png' },
      { name: 'Expo', logo: '/images/tools/expo.png' },
      { name: 'Figma', logo: '/images/tools/figma.png' },
      { name: 'TestFlight', logo: '/images/tools/testflight.png' },
      { name: 'App Store', logo: '/images/tools/app-store.png' },
      { name: 'Google Play', logo: '/images/tools/google-play.svg' },
    ],
    seo: {
    title: "Mobile App Development Services | iOS & Android App Development | SparkCurv",
    description:
      'Build high-performance iOS and Android mobile apps with SparkCurv. Expert app development, Flutter, React Native, UI/UX design, API integration, app store publishing, maintenance, and support.',
    keywords:
      "mobile app development services, mobile app development company, iOS app development, Android app development, Flutter app development, React Native development, custom mobile app development, native app development, enterprise mobile applications",
    canonical: 'https://sparkcurv.com/application-development/mobile-app',
  },
  },
  'outsourcing': {
    title: 'IT Outsourcing',
    subtitle: 'Scale Your Team with Expert Talent',
    description: 'Access a global pool of skilled developers and tech professionals. We provide dedicated teams that integrate seamlessly with your workflow to accelerate project delivery.',
    image: '/images/services/outsourcing-hero.jpg',
    features: [
      'Dedicated Development Teams',
      'Staff Augmentation',
      'Project-Based Outsourcing',
      'Quality Assurance',
      'Agile Methodologies',
      'Transparent Communication',
    ],
    tools: [
      { name: 'Slack', logo: '/images/tools/slack.svg' },
      { name: 'Jira', logo: '/images/tools/jira.svg' },
      { name: 'GitHub', logo: '/images/tools/github.png' },
      { name: 'Trello', logo: '/images/tools/trello.svg' },
      { name: 'Zoom', logo: '/images/tools/zoom.png' },
      { name: 'Microsoft Teams', logo: '/images/tools/teams.svg' },
      { name: 'Asana', logo: '/images/tools/asana.svg' },
      { name: 'Notion', logo: '/images/tools/notion.png' },
      { name: 'Confluence', logo: '/images/tools/confluence.svg' },
      { name: 'Monday.com', logo: '/images/tools/monday.svg' },
      { name: 'Miro', logo: '/images/tools/miro.svg' },
      { name: 'ClickUp', logo: '/images/tools/clickup.svg' },
    ],
    seo: {
  title: "IT Outsourcing Services | Dedicated Development Teams & Staff Augmentation | SparkCurv",
  description:
    "Scale your business with SparkCurv's IT outsourcing services. We provide dedicated development teams, staff augmentation, project-based outsourcing, quality assurance, and agile delivery to help businesses accelerate growth.",
  keywords:
    "IT outsourcing services, dedicated development teams, staff augmentation, offshore development team, software outsourcing, remote development team, IT staff augmentation, project outsourcing, dedicated developers, technology outsourcing",
  canonical: "https://sparkcurv.com/digital-growth/outsourcing",
}
  },
  'digital-marketing': {
    title: 'Digital Marketing',
    subtitle: 'Data-Driven Growth Strategies',
    description: 'Grow your brand with strategic digital marketing campaigns. We leverage SEO, content marketing, social media, and analytics to drive measurable results.',
    image: '/images/services/digital-marketing-hero.jpg',
    features: [
      'Search Engine Optimization (SEO)',
      'Content Marketing Strategy',
      'Social Media Management',
      'Pay-Per-Click Advertising',
      'Email Marketing Campaigns',
      'Analytics & Reporting',
    ],
    tools: [
      { name: 'Google Analytics', logo: '/images/tools/google-analytics.svg' },
      { name: 'Google Ads', logo: '/images/tools/google-ads.png' },
      { name: 'Meta Ads', logo: '/images/tools/meta.svg' },
      { name: 'Mailchimp', logo: '/images/tools/mailchimp.png' },
      { name: 'HubSpot', logo: '/images/tools/hubspot.png' },
      { name: 'Semrush', logo: '/images/tools/semrush.svg' },
      { name: 'Ahrefs', logo: '/images/tools/ahrefs.svg' },
      { name: 'Hootsuite', logo: '/images/tools/hootsuite.svg' },
      { name: 'Buffer', logo: '/images/tools/buffer.svg' },
      { name: 'Canva', logo: '/images/tools/canva.svg' },
      { name: 'LinkedIn Ads', logo: '/images/tools/linkedin.png' },
      { name: 'Twitter Ads', logo: '/images/tools/twitter.svg' },
    ],
    seo: {
  title: "Digital Marketing Services | SEO, Social Media & PPC Experts | SparkCurv",
  description:
    "Grow your business with SparkCurv's digital marketing services. We specialize in SEO, content marketing, social media management, PPC advertising, email marketing, and analytics-driven strategies that deliver measurable results.",
  keywords:
    "digital marketing services, SEO services, social media marketing, PPC advertising, content marketing, email marketing, search engine optimization, social media management, Google Ads services, digital marketing agency",
  canonical:
    "https://sparkcurv.com/digital-growth/digital-marketing",
}
  },
  'web-development': {
    title: 'Website Development',
    subtitle: 'Custom Web Solutions for Every Industry',
    description: 'We design and develop high-performance, scalable websites tailored to your business needs. From e-commerce platforms to enterprise portals, we build web experiences that convert visitors into customers.',
    image: '/images/platforms/webdev-hero.jpg',
    features: [
      'Custom Website Design & Development',
      'E-commerce Website Development',
      'Progressive Web Apps (PWA)',
      'CMS Development (WordPress, Custom)',
      'Responsive & Mobile-First Design',
      'API Integration & Backend Development',
      'Website Maintenance & Support',
      'Performance Optimization & SEO',
    ],
    tools: [
      { name: 'React', logo: '/images/tools/react.svg' },
      { name: 'Angular', logo: '/images/tools/angular.svg' },
      { name: 'Vue.js', logo: '/images/tools/vuejs.svg' },
      { name: 'Next.js', logo: '/images/tools/nextjs.svg' },
      { name: 'WordPress', logo: '/images/tools/wordpress.svg' },
      { name: 'Laravel', logo: '/images/tools/laravel.svg' },
      { name: 'Node.js', logo: '/images/tools/nodejs.svg' },
      { name: 'PHP', logo: '/images/tools/php.svg' },
      { name: 'Python', logo: '/images/tools/python.svg' },
      { name: 'MongoDB', logo: '/images/tools/mongodb.svg' },
      { name: 'MySQL', logo: '/images/tools/mysql.svg' },
      { name: 'PostgreSQL', logo: '/images/tools/postgresql.svg' },
      { name: 'Tailwind CSS', logo: '/images/tools/tailwindcss.svg' },
      { name: 'Bootstrap', logo: '/images/tools/bootstrap.svg' },
    ],
    platforms: [
      { name: 'E-commerce', image: '/images/platforms/ecommerce.jpg', description: 'Online stores, marketplaces, payment gateways' },
      { name: 'Healthcare', image: '/images/platforms/healthcare.jpg', description: 'Patient portals, telemedicine, health records' },
      { name: 'Education', image: '/images/platforms/education.jpg', description: 'LMS, e-learning, student portals' },
      { name: 'Real Estate', image: '/images/platforms/realestate.jpg', description: 'Property listings, virtual tours, CRM' },
      { name: 'Finance', image: '/images/platforms/finance.jpg', description: 'Banking portals, fintech, trading platforms' },
      { name: 'Travel', image: '/images/platforms/travel.jpg', description: 'Booking engines, travel portals, itinerary apps' },
      { name: 'Food & Restaurant', image: '/images/platforms/food.jpg', description: 'Online ordering, delivery apps, POS systems' },
      { name: 'Logistics', image: '/images/platforms/logistics.jpg', description: 'Fleet management, tracking, warehouse systems' },
    ],
    seo: {
  title:
    "Website Development Services | Custom Web Solutions for Every Industry | SparkCurv",
  description:
    "SparkCurv provides custom website development services, including e-commerce websites, PWAs, CMS development, API integrations, responsive design, and SEO optimization. We build scalable, high-performance web solutions for businesses across all industries.",
  keywords:
    "website development services, web development company, custom website development, web design services, responsive website design, e-commerce website development, business website development, CMS development, progressive web apps, SEO-friendly websites",
  canonical:
    "https://sparkcurv.com/application-development/web-development",
}
  },
  'database-management': {
    title: 'Database Management',
    subtitle: 'Reliable, Scalable & Secure Data Solutions',
    description: 'Ensure your data is always available, secure, and performing at its best. We provide end-to-end database management services including migration, optimization, monitoring, and disaster recovery.',
    image: '/images/platforms/database-hero.jpg',
    features: [
      'Database Design & Architecture',
      'Performance Tuning & Optimization',
      'Database Migration & Upgrades',
      '24/7 Database Monitoring & Alerts',
      'Backup & Disaster Recovery',
      'High Availability & Replication',
      'Security Audits & Compliance',
      'Cloud Database Management (AWS RDS, Azure SQL)',
    ],
    tools: [
      { name: 'MySQL', logo: '/images/tools/mysql.svg' },
      { name: 'PostgreSQL', logo: '/images/tools/postgresql.svg' },
      { name: 'MongoDB', logo: '/images/tools/mongodb.svg' },
      { name: 'Redis', logo: '/images/tools/redis.svg' },
      { name: 'Oracle', logo: '/images/tools/oracle.svg' },
      { name: 'MariaDB', logo: '/images/tools/mariadb.svg' },
      { name: 'SQLite', logo: '/images/tools/sqlite.svg' },
      { name: 'Cassandra', logo: '/images/tools/cassandra.svg' },
      { name: 'Elasticsearch', logo: '/images/tools/elasticsearch.svg' },
      { name: 'DynamoDB', logo: '/images/tools/dynamodb.svg' },
      { name: 'AWS', logo: '/images/tools/aws.svg' },
      { name: 'Prometheus', logo: '/images/tools/prometheus.svg' },
      { name: 'Grafana', logo: '/images/tools/grafana.svg' },
      { name: 'Docker', logo: '/images/tools/docker.png' },
    ],
    seo: {
  title:
    "Database Management Services | MySQL, PostgreSQL & MongoDB | SparkCurv",
  description:
    "Expert database management services by SparkCurv. We provide database design, optimization, migration, monitoring, backup, disaster recovery, security audits, and cloud database management for MySQL, PostgreSQL, MongoDB, Oracle, and more.",
  keywords:
    "database management services, database administration, MySQL database management, PostgreSQL services, MongoDB management, database optimization, database migration services, database monitoring, cloud database management, database backup and recovery",
  canonical:
    "https://sparkcurv.com/managed-cloud-service/database-management",
}
  },
};

const Services = ({ service }) => {
  const serviceData = servicesData[service];
  useScrollAnimation();

  if (!serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Service not found</p>
      </div>
    );
  }

  return (
    <div data-testid="service-page" className="pt-20">
      <SEO
  title={serviceData.seo?.title || `${serviceData.title} - Application Development`}
  description={serviceData.seo?.description || serviceData.description}
  keywords={serviceData.seo?.keywords}
  canonical={serviceData.seo?.canonical}
/>
      <section
        data-testid="service-hero"
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02028B] to-blue-600"
      >
        <div className="absolute inset-0 opacity-20">
          <img 
            src={serviceData.image}
            alt={serviceData.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-white font-bold">
              {serviceData.subtitle}
            </p>
          </div>
          <h1 className="font-clash text-5xl sm:text-6xl font-bold tracking-tighter mb-6 text-white animate-slide-up">
            {serviceData.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {serviceData.description}
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white" data-testid="service-features">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-on-scroll from-left">
              <h2 className="font-clash text-4xl sm:text-5xl font-medium tracking-tight mb-8 text-gray-900">
                What We Offer
              </h2>
              <ul className="space-y-4">
                {serviceData.features.map((feature, index) => (
                  <li
                    key={index}
                    data-testid={`feature-${index}`}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#02028B]" />
                    </div>
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 p-12 rounded-3xl shadow-lg reveal-on-scroll from-right">
              <h3 className="font-clash text-3xl font-bold mb-6 text-gray-900">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Let's discuss how our {serviceData.title.toLowerCase()} services can help transform
                your business and achieve your goals.
              </p>
              <Link
                to="/contact"
                data-testid="service-cta-button"
                className="bg-gradient-to-r from-[#02028B] to-blue-600 text-white hover:shadow-xl hover:shadow-[#02028B]/30 transition-all duration-300 rounded-full px-8 py-4 font-bold inline-flex items-center space-x-2 transform hover:scale-105"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Tools Section */}
          {serviceData.tools && (
            <div className="mt-24 reveal-on-scroll">
              <div className="text-center mb-12">
                <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-blue-100 rounded-full px-6 py-2 mb-4">
                  <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Technologies We Use</span>
                </div>
                <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Industry-Leading <span className="text-gradient-blue">{serviceData.title} Tools</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {serviceData.tools.map((tool, index) => (
                  <div
                    key={index}
                    data-testid={`tool-${index}`}
                    className={`group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center justify-center reveal-on-scroll delay-${(index % 6) + 1}`}
                  >
                    <div className="w-20 h-20 flex items-center justify-center mb-4">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="max-w-full max-h-full object-contain transition-all duration-300"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-[#02028B] transition-colors text-center">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platforms Section (Web Development only) */}
          {serviceData.platforms && (
            <div className="mt-24 reveal-on-scroll">
              <div className="text-center mb-12">
                <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-blue-100 rounded-full px-6 py-2 mb-4">
                  <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Industries We Serve</span>
                </div>
                <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Platforms We <span className="text-gradient-blue">Build For</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {serviceData.platforms.map((platform, index) => (
                  <div
                    key={index}
                    data-testid={`platform-${index}`}
                    className={`group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl reveal-on-scroll delay-${(index % 4) + 1}`}
                  >
                    <div className="h-40 overflow-hidden">
                      <img
                        src={platform.image}
                        alt={platform.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#02028B] transition-colors mb-1">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-gray-500">{platform.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {serviceData.faqs && <FAQSection faqs={serviceData.faqs} />}
    </div>
  );
};

export default Services;