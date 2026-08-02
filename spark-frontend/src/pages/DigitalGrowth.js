import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Palette, TrendingUp, Users } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import FAQSection from '../components/FAQSection';
import SEO from '../components/SEO';

const subPages = {
  'overview': {
    title: 'Digital Growth & Outsourcing',
    subtitle: 'Branding, Marketing & Team Scaling',
    description: 'We help businesses grow through powerful branding, data-driven digital marketing, and scalable outsourcing solutions. From brand identity to lead generation to dedicated development teams — we cover it all.',
    image: '/images/services/digital-growth-hero.jpg',
    features: [
      'Brand Identity Design & Strategy',
      'Search Engine Optimization (SEO)',
      'Social Media Marketing & Management',
      'Pay-Per-Click Advertising (PPC)',
      'Dedicated Development Teams',
      'Staff Augmentation & Project Outsourcing',
      'Content Marketing & Email Campaigns',
      'Analytics, Reporting & Growth Strategy',
    ],
    subServices: [
      { name: 'Branding', path: '/digital-growth/branding', icon: Palette, description: 'Logo design, brand identity, visual design & creative strategy' },
      { name: 'Digital Marketing', path: '/digital-growth/digital-marketing', icon: TrendingUp, description: 'SEO, content marketing, social media, PPC & analytics' },
      { name: 'Outsourcing', path: '/digital-growth/outsourcing', icon: Users, description: 'Dedicated teams, staff augmentation & project-based outsourcing' },
    ],
    faqs: [
      { question: 'What services fall under Digital Growth & Outsourcing?', answer: 'This category covers three core services: Branding (logo design, brand identity, visual design), Digital Marketing (SEO, PPC, social media, content marketing), and IT Outsourcing (dedicated teams, staff augmentation, project-based outsourcing).' },
      { question: 'Can I use individual services or do I need the full package?', answer: 'You can choose individual services or combine them for maximum impact. Many clients start with branding, then add digital marketing to drive growth, and use outsourcing to scale their development capacity as the business grows.' },
      { question: 'How do you measure the success of your services?', answer: 'We set clear KPIs for each service — brand awareness metrics for branding, traffic/leads/conversion rates for digital marketing, and delivery velocity/quality metrics for outsourcing. We provide regular reports and dashboards for full transparency.' },
      { question: 'Do you work with businesses outside India?', answer: 'Yes, we serve clients globally. Our digital marketing and outsourcing services are fully remote-friendly. We work across time zones and provide flexible engagement models that suit international collaboration.' },
      { question: 'How do I get started?', answer: 'Simply contact us through our website or WhatsApp. We will schedule a free consultation to understand your needs, propose a tailored strategy, and provide a detailed quote. Most projects kick off within 1-2 weeks of agreement.' },
    ],
  },
  'branding': {
    title: 'Branding',
    subtitle: 'Build a Powerful Brand Identity',
    description: 'Create a lasting impression with professional branding. We design logos, brand guidelines, marketing materials, and visual identities that resonate with your audience and set you apart from the competition.',
    image: '/images/services/branding-hero.jpg',
    features: [
      'Logo Design & Brand Mark',
      'Brand Strategy & Positioning',
      'Visual Identity & Style Guide',
      'Marketing Collateral Design',
      'Social Media Branding',
      'Packaging Design',
      'Motion Graphics & Animations',
      'Brand Audit & Refresh',
    ],
    tools: [
      { name: 'Photoshop', logo: '/images/tools/photoshop.svg' },
      { name: 'Illustrator', logo: '/images/tools/illustrator.svg' },
      { name: 'After Effects', logo: '/images/tools/after-effects.svg' },
      { name: 'Premiere Pro', logo: '/images/tools/premiere-pro.svg' },
      { name: 'Figma', logo: '/images/tools/figma.png' },
      { name: 'InVision', logo: '/images/tools/invision.svg' },
    ],
    faqs: [
      { question: 'What does your branding service include?', answer: 'Our branding service covers logo design, brand strategy, visual identity creation, style guides, marketing collateral, social media branding, packaging design, and motion graphics. We create a complete brand identity that resonates with your target audience.' },
      { question: 'How long does a branding project take?', answer: 'A typical branding project takes 2-4 weeks depending on scope. Logo design alone takes about 1-2 weeks with multiple concept rounds, while a complete brand identity package including style guide and collateral takes 3-6 weeks.' },
      { question: 'Do you offer brand refresh or rebranding services?', answer: 'Yes, we provide brand audits to assess your current positioning, and then execute refreshes or complete rebrands. Whether you need a modern update to your logo or a full strategic repositioning, we guide you through the entire process.' },
      { question: 'How many design concepts will I receive?', answer: 'For logo design, we typically present 3-5 initial concepts based on your brief. You can choose your favorite direction and we refine it through 2-3 revision rounds until you are completely satisfied with the final design.' },
      { question: 'Will I own the final brand assets?', answer: 'Absolutely. Upon project completion and final payment, you receive full ownership of all brand assets including source files (AI, PSD, EPS), web-ready files (SVG, PNG), and the complete brand style guide. All intellectual property rights are transferred to you.' },
    ],
    seo: {
    title:
      'Branding Agency | Logo Design, Brand Identity & Strategy | SparkCurv',
    description:
      "Build a strong and memorable brand with SparkCurv's professional branding services. We offer logo design, brand identity, brand strategy, visual identity, marketing materials, social media branding, and packaging design.",
    keywords:
      'branding agency, logo design services, brand identity design, brand strategy, visual identity, corporate branding, social media branding, packaging design, brand consulting, creative branding agency',
    canonical:
      'https://sparkcurv.com/digital-growth/branding',
  },
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
      'Conversion Rate Optimization',
      'Influencer Marketing',
    ],
    tools: [
      { name: 'Google Analytics', logo: '/images/tools/google-analytics.svg' },
      { name: 'Google Ads', logo: '/images/tools/google-ads.png' },
      { name: 'Meta Ads', logo: '/images/tools/meta.svg' },
      { name: 'Mailchimp', logo: '/images/tools/mailchimp.png' },
      { name: 'HubSpot', logo: '/images/tools/hubspot.svg' },
      { name: 'Semrush', logo: '/images/tools/semrush.png' },
      { name: 'Ahrefs', logo: '/images/tools/ahrefs.png' },
      { name: 'Buffer', logo: '/images/tools/buffer.png' },
      { name: 'LinkedIn Ads', logo: '/images/tools/linkedin.png' },
    ],
    faqs: [
      { question: 'What digital marketing services do you offer?', answer: 'We offer SEO (on-page, off-page, technical), content marketing, social media marketing, pay-per-click advertising (Google Ads, Meta Ads), email marketing, conversion rate optimization, influencer marketing, and analytics/reporting.' },
      { question: 'How soon can I see results from digital marketing?', answer: 'PPC campaigns can generate leads within days of launch. SEO typically shows significant results in 3-6 months. Social media engagement improves within the first month. We set realistic expectations and provide monthly progress reports with measurable KPIs.' },
      { question: 'Do you manage social media accounts?', answer: 'Yes, we provide full social media management including content strategy, post creation, scheduling, community management, engagement tracking, and paid campaign management across platforms like Instagram, Facebook, LinkedIn, Twitter, and YouTube.' },
      { question: 'How do you measure marketing ROI?', answer: 'We track key metrics including website traffic, lead generation, conversion rates, cost per acquisition, return on ad spend (ROAS), and revenue attribution. We set up Google Analytics, conversion tracking, and custom dashboards so you can see ROI in real-time.' },
      { question: 'Can you work with our existing marketing team?', answer: 'Absolutely. We frequently collaborate with in-house marketing teams, acting as an extension of your department. We can handle specific channels (like SEO or PPC) while your team manages others, or provide strategic guidance across all channels.' },
    ],
    seo: {
    title:
      'Digital Marketing Services | SEO, Social Media & PPC Experts | SparkCurv',
    description:
      "Grow your business with SparkCurv's digital marketing services. We specialize in SEO, content marketing, social media management, PPC advertising, email marketing, and analytics-driven strategies that deliver measurable results.",
    keywords:
      'digital marketing services, SEO services, social media marketing, PPC advertising, content marketing, email marketing, search engine optimization, social media management, Google Ads services, digital marketing agency',
    canonical:
      'https://sparkcurv.com/digital-growth/digital-marketing',
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
      'Quality Assurance & Testing',
      'Agile Methodologies',
      'Transparent Communication',
      'Flexible Engagement Models',
      'IP Protection & NDA Compliance',
    ],
    tools: [
      { name: 'Slack', logo: '/images/tools/slack.svg' },
      { name: 'Jira', logo: '/images/tools/jira.svg' },
      { name: 'GitHub', logo: '/images/tools/github.png' },
      { name: 'Trello', logo: '/images/tools/trello.svg' },
      { name: 'Asana', logo: '/images/tools/asana.svg' },
      { name: 'Notion', logo: '/images/tools/notion.png' },
      { name: 'Confluence', logo: '/images/tools/confluence.svg' },
      { name: 'Miro', logo: '/images/tools/miro.svg' },
      { name: 'ClickUp', logo: '/images/tools/clickup.svg' },
    ],
    faqs: [
      { question: 'What outsourcing models do you offer?', answer: 'We offer three engagement models: Dedicated Teams (full-time developers working exclusively on your project), Staff Augmentation (individual experts integrated into your existing team), and Project-Based Outsourcing (complete project delivery with defined scope and timeline).' },
      { question: 'How do you ensure quality in outsourced projects?', answer: 'We follow rigorous quality processes including code reviews, automated testing, CI/CD pipelines, sprint demos, and regular client check-ins. Every team member is vetted and trained in our quality standards. We also provide dedicated project managers for oversight.' },
      { question: 'What time zones do your teams work in?', answer: 'Our primary team is based in India (IST), but we offer flexible working hours to overlap with US, European, and APAC time zones. For dedicated teams, we can arrange shifts that fully align with your business hours for real-time collaboration.' },
      { question: 'How do you protect our intellectual property?', answer: 'All team members sign strict NDAs and IP assignment agreements before joining your project. We use secure development environments, access controls, and encrypted communication channels. Full IP ownership transfers to you as per our standard contract terms.' },
      { question: 'How quickly can you set up a dedicated team?', answer: 'We can typically assemble a dedicated team within 1-2 weeks depending on the skill requirements. For common tech stacks (React, Node.js, Python, Java), we often have pre-vetted developers ready to start immediately.' },
    ],
    seo: {
    title:
      'IT Outsourcing Services | Dedicated Development Teams & Staff Augmentation | SparkCurv',
    description:
      "Scale your business with SparkCurv's IT outsourcing services. We provide dedicated development teams, staff augmentation, project-based outsourcing, quality assurance, and agile delivery to accelerate your development process.",
    keywords:
      'IT outsourcing services, dedicated development teams, staff augmentation services, offshore development team, remote developers, software outsourcing company, IT staff augmentation, project outsourcing, hire dedicated developers, technology outsourcing',
    canonical:
      'https://sparkcurv.com/digital-growth/outsourcing',
  },
  },
};


const DigitalGrowth = () => {
  const { subpage } = useParams();
  const page = subpage || 'overview';
  const data = subPages[page];
  useScrollAnimation();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Page not found</p>
      </div>
    );
  }

  const isOverview = page === 'overview';
  const subNavLinks = [
    { name: 'Overview', path: '/digital-growth', key: 'overview' },
    { name: 'Branding', path: '/digital-growth/branding', key: 'branding' },
    { name: 'Digital Marketing', path: '/digital-growth/digital-marketing', key: 'digital-marketing' },
    { name: 'Outsourcing', path: '/digital-growth/outsourcing', key: 'outsourcing' },
  ];

  return (
    <div data-testid="digital-growth-page" className="pt-20">
      {data.seo && (
  <SEO
    title={data.seo.title}
    description={data.seo.description}
    keywords={data.seo.keywords}
    canonical={data.seo.canonical}
  />
)}
      {/* Hero Section */}
      <section
        data-testid="digital-growth-hero"
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
            {subNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`subnav-${link.key}`}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  page === link.key || (isOverview && link.key === 'overview')
                    ? 'bg-[#02028B] text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {link.name}
              </Link>
            ))}
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
                Grow Your <span className="text-gradient-blue">Business</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {data.subServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.path}
                    to={service.path}
                    data-testid={`subservice-card-${index}`}
                    className={`group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl reveal-on-scroll delay-${index + 1}`}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#02028B] to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-clash text-xl font-bold text-gray-900 mb-3 group-hover:text-[#02028B] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.description}</p>
                    <div className="flex items-center text-[#02028B] font-semibold text-sm">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
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
                  Let's discuss how our {data.title.toLowerCase()} services can help grow your business.
                </p>
                <Link
                  to="/contact"
                  data-testid="growth-cta-button"
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
                    <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Tools We Use</span>
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
          </div>
        </section>
      )}

      {data.faqs && <FAQSection faqs={data.faqs} />}
    </div>
  );
};

export default DigitalGrowth;
