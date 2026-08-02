import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Cloud, Code, Users, TrendingUp, Sparkles, Check, Star } from 'lucide-react';
import FAQSection from '../components/FAQSection';
import SEO from '../components/SEO';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const Home = () => {

  // ── Hero background: video → slideshow ──────────────────────────────────
  const heroSlides = [
    "/images/home/devops.jpg",
    "/images/home1/cloudservice.png",
    "/images/home1/gitlab.jpg",
    "/images/home1/digital_marketing.jpg",
    "/images/home/devops.jpg",
  ];

  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideshowRef = useRef(null);

  // When video ends → switch to slideshow
  const handleVideoEnd = () => {
    setShowSlideshow(true);
  };

  // Once slideshow is visible, start cycling images every 4 s
  useEffect(() => {
    if (!showSlideshow) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showSlideshow]);

  // ── Services ─────────────────────────────────────────────────────────────
  const services = [
    {
      title: 'AI & ML Services',
      description: 'Transform your business with intelligent automation and predictive analytics powered by cutting-edge AI.',
      icon: Zap,
      link: '/ai-ml',
      video: '/videos/aiml3.mp4',
    },
    {
      title: 'Managed Cloud Service',
      description: 'End-to-end cloud management — infrastructure, CI/CD, containerization, monitoring and database administration.',
      icon: Cloud,
      link: '/managed-cloud-service',
      video: '/videos/cloudvideo-compressed1.mp4',
    },
    {
      title: 'Application Development',
      description: 'Custom web and mobile apps for every industry — E-commerce, Healthcare, Education, Finance and more.',
      icon: Code,
      link: '/application-development',
      video: '/videos/application2.mp4',
    },
    {
      title: 'Digital Growth & Outsourcing',
      description: 'Grow your brand with branding, digital marketing, and scalable outsourcing solutions — from identity design to dedicated teams.',
      icon: TrendingUp,
      link: '/digital-growth',
      video: '/videos/outsource.mp4',
    },
  ];

  const stats = [
    { value: '30+', label: 'Projects Delivered', icon: Star },
    { value: '98%', label: 'Client Satisfaction', icon: Sparkles },
    { value: '15+', label: 'Team Members', icon: Users },
    { value: '24/7', label: 'Support Available', icon: Cloud },
  ];

  const serviceContent = [
    {
      title: "AI & ML Services",
      paragraph: "We build intelligent systems that learn, adapt, and automate — from predictive analytics to natural language processing, turning your data into a competitive edge.",
    },
    {
      title: "Managed Cloud Service",
      paragraph: "Scalable, secure, and always-on cloud infrastructure tailored for your business. We handle DevOps, CI/CD pipelines, and 24/7 monitoring so you can focus on growth.",
    },
    {
      title: "Application Development",
      paragraph: "From sleek mobile apps to robust web platforms, we engineer pixel-perfect, high-performance applications that deliver real results across every industry.",
    },
    {
      title: "Digital Growth & Outsourcing",
      paragraph: "Amplify your brand with data-driven marketing, creative design, and dedicated remote teams — everything you need to scale fast without scaling costs.",
    },
  ];

  const [activeService, setActiveService] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const fullText = serviceContent[activeService].paragraph;
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;

    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 22);

    return () => clearInterval(typeInterval);
  }, [activeService]);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % serviceContent.length);
    }, 5000);
    return () => clearInterval(rotateInterval);
  }, []);

  return (
    <div data-testid="home-page" className="overflow-hidden">
      <SEO
        title="SparkCurv Technologies | AI, Cloud, Web & App Development Company"
        description="SparkCurv Technologies delivers AI & ML solutions, cloud services, web development, mobile apps, digital marketing, and IT outsourcing to help businesses scale faster with modern technology."
        keywords="software company, AI development, machine learning services, cloud computing, web development, mobile app development, digital marketing agency, IT outsourcing, SaaS development, India tech company"
        canonical="https://sparkcurv.com/"
      />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        data-testid="hero-section"
        className="relative flex items-center pt-28 pb-20 overflow-hidden"
        style={{ minHeight: '100vh' }}
      >

        {/* Background Video — visible until it finishes */}
        <video
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ zIndex: 1, opacity: showSlideshow ? 0 : 1, pointerEvents: 'none' }}
        >
          <source src="/videos/backgroundvideo.mp4" type="video/mp4" />
        </video>

        {/* Background Slideshow — fades in after video ends */}
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000"
          style={{ zIndex: 1, opacity: showSlideshow ? 1 : 0 }}
        >
          {heroSlides.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: currentSlide === i ? 1 : 0 }}
            />
          ))}
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/60" style={{ zIndex: 2 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-black/20" style={{ zIndex: 2 }} />

        {/* Decorative blobs */}
        <div className="absolute top-40 right-[10%] w-[400px] h-[400px] rounded-full bg-gray-300/30 blur-3xl pointer-events-none" style={{ zIndex: 2 }} />
        <div className="absolute bottom-20 left-[5%] w-[300px] h-[300px] rounded-full bg-gray-200/30 blur-3xl pointer-events-none" style={{ zIndex: 2 }} />

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

            {/* ── Left Column ────────────────────────────────────────────── */}
            <div className="col-span-1 lg:col-span-7 space-y-8">
              <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-xs font-semibold text-white uppercase tracking-[0.2em]">
                  Innovation Meets Precision
                </span>
              </div>

              {/* Animated heading */}
              <h1 className="font-inter text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-none">
                <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.1em" }}>
                  {"We Engineer".split("").map((letter, index) => (
                    <span
                      key={index}
                      style={{
                        color: "white",
                        opacity: 0,
                        display: "inline-block",
                        animation: "splashLetterAnim 0.5s forwards",
                        animationDelay: `${0.05 * (index + 1)}s`,
                        transform: "translate(-300px, 0) scale(0)",
                      }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </span>

                <br />

                <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.05em", marginTop: "0.5rem" }}>
                  {"Digital Evolution".split("").map((letter, index) => (
                    <span
                      key={index}
                      style={{
                        color: "#D4AF37",
                        opacity: 0,
                        display: "inline-block",
                        animation: "splashLetterAnim 0.5s forwards",
                        animationDelay: `${0.05 * (index + 1) + 0.6}s`,
                        transform: "translate(-300px, 0) scale(0)",
                      }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </span>
              </h1>

              <style>{`
                @keyframes splashLetterAnim {
                  60%  { transform: translate(20px, 0) scale(0); }
                  80%  { transform: translate(20px, 0) scale(1); }
                  99%  { transform: translate(0) scale(1.2); color: #D4AF37; }
                  100% { transform: translate(0) scale(1); opacity: 1; }
                }
              `}</style>

              <p className="text-white text-base leading-relaxed font-medium">
                At SparkCurv, we transform bold ideas into market-ready realities through
                cutting-edge technology and innovative design.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to="/contact"
                  data-testid="hero-cta-primary"
                  className="group inline-flex items-center justify-center rounded-full bg-[#02028B] px-8 py-4 text-sm font-medium text-white hover:bg-[#0303b5] hover:shadow-xl hover:shadow-[#02028B]/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>Start Your Project</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/about"
                  data-testid="hero-cta-secondary"
                  className="group inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-8 py-4 text-sm font-medium text-white hover:bg-white hover:text-[#02028B] transition-all duration-300"
                >
                  <span>Meet Our Team</span>
                  <Users className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>

            {/* ── Right Column ───────────────────────────────────────────── */}
            <div className="col-span-1 lg:col-span-5 relative hidden lg:block">
              <div className="relative h-[480px] flex flex-col justify-center space-y-8 px-4">

                {/* Service Tabs */}
                <div className="flex flex-col gap-3">
                  {serviceContent.map((service, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveService(index)}
                      className="flex items-center gap-3 group text-left"
                    >
                      <motion.span
                        animate={{
                          opacity: activeService === index ? 1 : 0,
                          x: activeService === index ? 0 : -8,
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-[#D4AF37] text-lg flex-shrink-0"
                      >
                        ›
                      </motion.span>
                      <span
                        className={`font-inter font-semibold text-lg tracking-tight transition-all duration-300 ${
                          activeService === index
                            ? 'text-[#D4AF37]'
                            : 'text-white/40 group-hover:text-white/70'
                        }`}
                      >
                        {service.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-white/10" />

                {/* Typing Paragraph */}
                <div className="min-h-[100px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeService}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-white text-base leading-relaxed font-medium">
                        {displayedText}
                        {isTyping && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-[2px] h-4 bg-[#D4AF37] ml-1 align-middle"
                          />
                        )}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    key={activeService}
                    className="h-full bg-[#D4AF37] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                  />
                </div>

              </div>

              {/* Client Satisfaction Badge */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl p-[2px] animated-border">
                <div className="bg-white rounded-2xl p-5 relative z-10">
                  <div className="text-2xl font-inter font-bold text-[#02028B]">98%</div>
                  <div className="text-xs text-gray-600 font-medium">Client Satisfaction</div>
                </div>
              </div>

              {/* Projects Delivered Badge */}
              <div
                className="absolute -top-4 -right-4 bg-[#02028B] rounded-2xl p-5 text-white"
                style={{ boxShadow: "0 10px 30px rgba(2, 2, 139, 0.4), 0 0 20px rgba(2, 2, 139, 0.3)" }}
              >
                <div className="text-2xl font-inter font-bold">30+</div>
                <div className="text-xs text-blue-200 font-medium">Projects Delivered</div>
              </div>

            </div>
            {/* ── End Right Column ─────────────────────────────────────── */}

          </div>
        </div>
      </section>
      {/* ── End Hero Section ─────────────────────────────────────────────── */}


      {/* Partners Section */}
      <section className="relative py-20 bg-white overflow-hidden reveal-on-scroll" data-testid="partners-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-[#CCCCCC]/10 rounded-full px-6 py-2 mb-6">
              <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Partners</span>
            </div>
            <h2 className="font-inter text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gray-900">We're </span>
              <span className="text-gradient-blue">Working With</span>
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex overflow-hidden">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center gap-16 animate-marquee" aria-hidden={dup === 1}>
                  {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((n, index) => (
                    <div
                      key={`${dup}-${index}`}
                      data-testid={dup === 0 ? `partner-logo-${index}` : undefined}
                      className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500"
                    >
                      <img
                        src={`/images/partners/${n}.svg`}
                        alt={`Partner ${n}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section
        className="relative py-20 text-white overflow-hidden"
        style={{
          backgroundImage: "url('/images/home/client2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`text-center reveal-on-scroll delay-${index + 1}`} data-testid={`stat-${index}`}>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="font-inter text-4xl font-semibold mb-1 text-white">{stat.value}</div>
                  <div className="text-sm text-white/70 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Services Section */}
      <section
        className="relative pt-[1cm] pb-24 lg:pb-32 px-6 lg:px-24 overflow-hidden border-gray-200"
        style={{ border: "12px solid #e5e7eb" }}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute top-20 right-0 w-[450px] h-[450px] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-24">
          <div className="mb-10 text-center reveal-on-scroll">
            <span className="text-sm uppercase tracking-[0.2em] font-semibold text-[#02028B]">Our Expertise</span>
            <h2 className="font-inter text-3xl sm:text-4xl font-medium tracking-tight mt-4 text-[#1A1A1A]">
              Comprehensive Solutions for<br />Your Digital Success
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.link}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -120 : 120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                >
                  <Link
                    to={service.link}
                    data-testid={`service-card-${service.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group relative bg-white rounded-2xl overflow-hidden border border-[#02028B]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <video
                        src={service.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#d1d5db]/40 via-[#d1d5db]/10 to-transparent" />
                      <div className="absolute top-5 right-5 w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-inter font-medium mb-3 text-[#1A1A1A] group-hover:text-[#02028B] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed mb-5">
                        {service.description}
                      </p>
                      <div className="flex items-center text-[#02028B] text-sm font-medium gap-2 group-hover:gap-3 transition-all">
                        <span>Explore Service</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <FAQSection faqs={[
        { question: 'What services does SparkCurv offer?', answer: 'SparkCurv provides a comprehensive suite of IT services including AI & ML Solutions, Managed Cloud Services, Application Development (Web & Mobile), Digital Marketing, Branding, and IT Outsourcing. We deliver end-to-end technology solutions tailored to your business needs.' },
        { question: 'How can I get a quote for my project?', answer: 'Simply visit our Contact page or click the WhatsApp button to reach out. Share your project requirements and our team will provide a detailed proposal within 24-48 hours. We offer free initial consultations to understand your needs.' },
        { question: 'Do you work with startups and enterprises?', answer: 'Yes, we work with businesses of all sizes — from early-stage startups to established enterprises. Our flexible engagement models allow us to scale our services to match your project scope, budget, and timeline.' },
        { question: 'Where is SparkCurv located?', answer: 'Our main branch is in Nagercoil, Tamil Nadu, and we have a sales office in Bangalore, Karnataka. We serve clients globally and offer both on-site and remote engagement models.' },
        { question: 'What industries do you serve?', answer: 'We serve a wide range of industries including E-commerce, Healthcare, Education, Finance, Real Estate, Travel, Food & Restaurant, Logistics, and more. Our cross-industry experience enables us to deliver domain-specific solutions.' },
      ]} />
    </div>
  );
};

export default Home;