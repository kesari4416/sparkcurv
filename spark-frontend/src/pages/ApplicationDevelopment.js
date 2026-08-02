import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Globe, Smartphone } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import FAQSection from '../components/FAQSection';
import SEO from '../components/SEO';

const subPages = {
  'overview': {
    title: 'Application Development',
    subtitle: 'Web & Mobile Solutions for Every Business',
    description: 'We build high-performance web and mobile applications tailored to your business needs. From e-commerce platforms to enterprise mobile apps, our team delivers solutions that drive engagement and revenue.',
    image: '/images/services/app-dev-hero.jpg',
    features: [
      'Custom Web Application Development',
      'Mobile App Development (iOS & Android)',
      'E-commerce & Marketplace Solutions',
      'Progressive Web Apps (PWA)',
      'Cross-Platform Mobile Development',
      'UI/UX Design & Prototyping',
      'API Development & Integration',
      'Maintenance & Support',
    ],
    subServices: [
      { name: 'Web Development', path: '/application-development/web-development', icon: Globe, description: 'Custom websites, web apps, e-commerce platforms for every industry' },
      { name: 'Mobile App', path: '/application-development/mobile-app', icon: Smartphone, description: 'Native & cross-platform mobile apps for iOS and Android' },
    ],
    faqs: [
      { question: 'What types of applications do you develop?', answer: 'We develop custom web applications, mobile apps (iOS & Android), progressive web apps, e-commerce platforms, enterprise portals, SaaS products, and cross-platform solutions. Each project is tailored to your specific business requirements and target audience.' },
      { question: 'How long does it take to develop an application?', answer: 'Development timelines depend on complexity. A simple web app takes 4-8 weeks, a medium-complexity app 2-4 months, and enterprise-grade applications 4-8 months. We provide a detailed timeline during the planning phase after understanding your requirements.' },
      { question: 'Do you offer UI/UX design services?', answer: 'Yes, UI/UX design is an integral part of our development process. We create wireframes, prototypes, and high-fidelity designs using Figma before development begins. Our designs focus on user experience, accessibility, and conversion optimization.' },
      { question: 'What technologies do you use for development?', answer: 'We use modern technology stacks including React, Angular, Vue.js, Next.js for web; React Native and Flutter for mobile; Node.js, Python, Laravel, and PHP for backend. We choose the best stack based on your project requirements, scalability needs, and budget.' },
      { question: 'Do you provide post-launch support and maintenance?', answer: 'Absolutely. We offer ongoing maintenance packages that include bug fixes, performance monitoring, security updates, feature enhancements, and technical support. We ensure your application stays up-to-date and performs optimally after launch.' },
    ],
    seo: {
  title:
    "Application Development Services | Web & Mobile App Development | SparkCurv",
  description:
    "SparkCurv delivers custom web and mobile application development services, including web apps, iOS and Android apps, e-commerce solutions, PWAs, API integration, UI/UX design, and ongoing support to help businesses grow.",
  keywords:
    "application development services, app development services, custom application development, web application development, mobile application development, software development company, business application development, enterprise application development, UI UX design services, app development company",
  canonical:
    "https://sparkcurv.com/application-development",
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
      { name: 'React', logo: '/images/tools/react.png' },
      { name: 'Angular', logo: '/images/tools/angular.png' },
      { name: 'Vue.js', logo: '/images/tools/vuejs.svg' },
      { name: 'Next.js', logo: '/images/tools/nextjs.png' },
      { name: 'WordPress', logo: '/images/tools/wordpress.svg' },
      { name: 'Laravel', logo: '/images/tools/laravel.svg' },
      { name: 'Node.js', logo: '/images/tools/nodejs.png' },
      { name: 'PHP', logo: '/images/tools/php.png' },
      { name: 'Python', logo: '/images/tools/python.svg' },
      { name: 'Tailwind CSS', logo: '/images/tools/tailwindcss.png' },
      { name: 'Bootstrap', logo: '/images/tools/bootstrap.png' },
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
    faqs: [
      { question: 'What types of websites do you build?', answer: 'We build all types of websites including corporate websites, e-commerce stores, SaaS platforms, CMS-based sites, portfolio websites, landing pages, progressive web apps, and custom web applications. Each project is designed to meet your specific business goals.' },
      { question: 'Do you build responsive websites?', answer: 'Yes, every website we build is fully responsive and mobile-first. Our designs adapt seamlessly across all devices — desktops, tablets, and smartphones — ensuring a consistent user experience regardless of screen size.' },
      { question: 'Can you build an e-commerce website?', answer: 'Absolutely. We develop full-featured e-commerce platforms with product catalogs, shopping carts, secure payment gateways, inventory management, order tracking, and analytics. We work with platforms like Shopify, WooCommerce, and custom-built solutions.' },
      { question: 'Do you offer SEO-friendly web development?', answer: 'Yes, SEO is built into our development process from the start. We implement clean code structure, semantic HTML, optimized page speed, meta tags, schema markup, sitemap generation, and mobile optimization — all essential for strong search engine rankings.' },
      { question: 'How much does a website cost?', answer: 'Website costs vary based on complexity, features, and design requirements. A basic website starts from a few hundred dollars, while complex web applications can range into thousands. We provide detailed quotes after understanding your specific requirements during the initial consultation.' },
    ],
    seo: {
  title:
    "Website Development Services | Custom Web Solutions for Every Industry | SparkCurv",
  description:
    "SparkCurv provides custom website development services, including e-commerce websites, PWAs, CMS development, API integrations, responsive design, and SEO optimization. We build scalable, high-performance web solutions for businesses across all industries.",
  keywords:
    "website development services, web development company, custom website development, web design services, responsive website design, e-commerce website development, business website development, CMS development, progressive web apps, SEO-friendly websites, React development, Node.js development",
  canonical:
    "https://sparkcurv.com/application-development/web-development",
}
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
      'Push Notifications & Analytics',
      'Third-Party API Integration',
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
    ],
    faqs: [
      { question: 'Do you build apps for both iOS and Android?', answer: 'Yes, we develop for both platforms. We offer native development (Swift for iOS, Kotlin for Android) for maximum performance, and cross-platform development (React Native, Flutter) for faster delivery and cost efficiency with a single codebase.' },
      { question: 'How long does it take to build a mobile app?', answer: 'A simple app takes 6-10 weeks, a moderately complex app 3-5 months, and a feature-rich enterprise app 5-8 months. We follow an agile approach and deliver working builds every 2 weeks so you can see progress early and provide feedback.' },
      { question: 'Will you help publish the app on App Store and Google Play?', answer: 'Yes, we handle the entire publishing process including app store optimization (ASO), screenshot creation, description writing, compliance review, and submission to both Apple App Store and Google Play Store.' },
      { question: 'Do you provide app maintenance after launch?', answer: 'Absolutely. We offer post-launch support including bug fixes, OS compatibility updates, performance monitoring, feature enhancements, and analytics tracking. We ensure your app stays compatible with the latest iOS and Android versions.' },
      { question: 'Can you integrate third-party services into the app?', answer: 'Yes, we integrate a wide range of third-party services including payment gateways (Stripe, Razorpay), push notifications (Firebase), analytics (Mixpanel, Amplitude), maps (Google Maps), social media, and any service with a REST or GraphQL API.' },
    ],
    seo: {
  title:
    "Mobile App Development Services | iOS & Android App Development | SparkCurv",
  description:
    "Build high-performance iOS and Android mobile apps with SparkCurv. We provide mobile app development services including Flutter, React Native, UI/UX design, API integration, app store publishing, maintenance, and ongoing support.",
  keywords:
    "mobile app development services, app development company, iOS app development, Android app development, Flutter development, React Native development, custom mobile app development, cross-platform app development, mobile application development company, UI UX design services",
  canonical:
    "https://sparkcurv.com/application-development/mobile-app",
}
  },
};

const ApplicationDevelopment = () => {
  const { subpage } = useParams();
  const page = subpage || 'overview';
  const data = subPages[page];
  const seo = data.seo || {};
  useScrollAnimation();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Page not found</p>
      </div>
    );
  }

  const isOverview = page === 'overview';

  return (
    <div data-testid="app-dev-page" className="pt-20">
      <SEO
  title={seo.title || `${data.title} | Application Development`}
  description={seo.description || data.description}
  keywords={seo.keywords}
  canonical={seo.canonical}
/>
      {/* Hero Section */}
      <section
        data-testid="app-dev-hero"
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02028B] to-blue-600"
      >
        <div className="absolute inset-0 opacity-20">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-white font-bold">{data.subtitle}</p>
          </div>
          <h1 className="font-clash text-5xl sm:text-6xl font-bold tracking-tighter mb-6 text-white animate-slide-up">
            {data.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {data.description}
          </p>
        </div>
      </section>

      {/* Sub-Navigation */}
      <section className="bg-gray-50 border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-hide">
            <Link
              to="/application-development"
              data-testid="subnav-overview"
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isOverview ? 'bg-[#02028B] text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/application-development/web-development"
              data-testid="subnav-web-development"
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                page === 'web-development' ? 'bg-[#02028B] text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Web Development
            </Link>
            <Link
              to="/application-development/mobile-app"
              data-testid="subnav-mobile-app"
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                page === 'mobile-app' ? 'bg-[#02028B] text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mobile App
            </Link>
          </div>
        </div>
      </section>

      {/* Overview: Sub-services grid */}
      {isOverview && (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16 reveal-on-scroll">
              <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-blue-100 rounded-full px-6 py-2 mb-4">
                <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Our Services</span>
              </div>
              <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Build Your <span className="text-gradient-blue">Digital Product</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {data.subServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.path}
                    to={service.path}
                    data-testid={`subservice-card-${index}`}
                    className={`group relative bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl reveal-on-scroll delay-${index + 1}`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#02028B] to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-clash text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#02028B] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-6">{service.description}</p>
                    <div className="flex items-center text-[#02028B] font-semibold">
                      <span>Explore</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Features */}
            <div className="mt-24 reveal-on-scroll">
              <div className="text-center mb-12">
                <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  What We <span className="text-gradient-blue">Offer</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.features.map((feature, index) => (
                  <div key={index} className={`flex items-start space-x-3 p-4 rounded-xl bg-gray-50 reveal-on-scroll delay-${(index % 4) + 1}`}>
                    <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#02028B]" />
                    </div>
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sub-page: Features + Tools */}
      {!isOverview && (
        <section className="py-24 md:py-32 bg-white" data-testid="subpage-content">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="reveal-on-scroll from-left">
                <h2 className="font-clash text-4xl sm:text-5xl font-medium tracking-tight mb-8 text-gray-900">
                  What We Offer
                </h2>
                <ul className="space-y-4">
                  {data.features.map((feature, index) => (
                    <li key={index} data-testid={`feature-${index}`} className="flex items-start space-x-3">
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
                  Let's discuss how our {data.title.toLowerCase()} services can help bring your vision to life.
                </p>
                <Link
                  to="/contact"
                  data-testid="app-dev-cta-button"
                  className="bg-gradient-to-r from-[#02028B] to-blue-600 text-white hover:shadow-xl hover:shadow-[#02028B]/30 transition-all duration-300 rounded-full px-8 py-4 font-bold inline-flex items-center space-x-2 transform hover:scale-105"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Tools Section */}
            {data.tools && (
              <div className="mt-24 reveal-on-scroll">
                <div className="text-center mb-12">
                  <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-blue-100 rounded-full px-6 py-2 mb-4">
                    <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Technologies We Use</span>
                  </div>
                  <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                    Industry-Leading <span className="text-gradient-blue">{data.title} Tools</span>
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {data.tools.map((tool, index) => (
                    <div
                      key={index}
                      data-testid={`tool-${index}`}
                      className={`group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center justify-center reveal-on-scroll delay-${(index % 6) + 1}`}
                    >
                      <div className="w-20 h-20 flex items-center justify-center mb-4">
                        <img src={tool.logo} alt={tool.name} className="max-w-full max-h-full object-contain transition-all duration-300" />
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
            {data.platforms && (
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
                  {data.platforms.map((platform, index) => (
                    <div
                      key={index}
                      data-testid={`platform-${index}`}
                      className={`group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl reveal-on-scroll delay-${(index % 4) + 1}`}
                    >
                      <div className="h-40 overflow-hidden">
                        <img src={platform.image} alt={platform.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#02028B] transition-colors mb-1">{platform.name}</h3>
                        <p className="text-sm text-gray-500">{platform.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {data.faqs && <FAQSection faqs={data.faqs} />}
    </div>
  );
};

export default ApplicationDevelopment;
