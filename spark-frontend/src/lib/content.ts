/**
 * Site copy in one place. Headline, intro and services come from the current
 * sparkcurv.com site.
 */

export const site = {
  name: 'SparkCurv',
  legalName: 'SparkCurv Technologies',
  email: 'sales@sparkcurv.com',
  phone: '+91 96774 95028',
  address: ['64/3 Thompson Street, Palace Road', 'Nagercoil, Tamil Nadu 629001'],
  /** Footer line from the live site. */
  tagline:
    'Turning ideas into digital brilliance. We craft sleek apps, stunning websites, and smart tech solutions to power your success.',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  description:
    'SparkCurv transforms bold ideas into market-ready realities through cutting-edge technology and innovative design: AI & ML, managed cloud, application development and digital growth.',
} as const;

export const hero = {
  eyebrow: 'Innovation meets precision',
  /** Each entry is one line of the headline. `accent` lines get the light gradient treatment. */
  headline: [
    { text: 'We engineer', accent: false },
    { text: 'digital', accent: false },
    { text: 'evolution.', accent: true },
  ],
  intro:
    'At SparkCurv, we transform bold ideas into market-ready realities through cutting-edge technology and innovative design.',
  services: ['AI & ML services', 'Managed cloud', 'Application development', 'Digital growth & outsourcing'],
  cta: { label: 'Start a project', href: '/contact' },
  secondaryCta: { label: 'Meet our team', href: '/about' },
};

/**
 * Hero ticker: service commitments stated on sparkcurv.com (pricing FAQ, managed cloud
 * and application development pages). Keep these in sync with what sales actually offers.
 */
export const commitments = [
  { label: 'Average response time', value: '15 min' },
  { label: 'P1 incidents acknowledged', value: '5 min' },
  { label: 'Proposal turnaround', value: '24–48 h' },
  { label: 'Working builds', value: 'Every 2 weeks' },
  { label: 'Project kick-off', value: '1–2 weeks' },
  { label: 'Office', value: 'Nagercoil, Tamil Nadu' },
];

/** Main navigation (home header + footer). All paths are live routes. */
export const nav = [
  { label: 'AI & ML', href: '/ai-ml' },
  { label: 'Cloud', href: '/managed-cloud-service' },
  { label: 'Apps', href: '/application-development' },
  { label: 'Growth', href: '/digital-growth' },
  { label: 'Products', href: '/products' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

/** Section 4 — bento grid. `size` drives the asymmetric layout (see sections/FeatureBento). Every tile has a photo; small tiles also carry an icon. */
export const features = [
  {
    title: 'AI & ML services',
    body: 'Transform your business with intelligent automation and predictive analytics powered by cutting-edge AI.',
    href: '/ai-ml',
    image: '/images/services/ai-ml-hero.jpg',
    size: 'xl',
    hover: 'zoom',
  },
  {
    title: 'Cloud services',
    body: 'Scalable infrastructure on AWS, Azure and GCP, managed end to end.',
    href: '/managed-cloud-service/cloud-services',
    image: '/images/services/cloud-services-hero.jpg',
    size: 'md',
    hover: 'zoom',
  },
  {
    title: 'CI/CD automation',
    body: 'Automated build, test and deploy pipelines.',
    href: '/managed-cloud-service/cicd-automation',
    image: '/images/services/cicd-hero.jpg',
    icon: 'pipeline',
    size: 'sm',
    hover: 'spin',
  },
  {
    title: 'Infrastructure as code',
    body: 'Version-controlled Terraform, CloudFormation and Ansible.',
    href: '/managed-cloud-service/infrastructure-as-code',
    image: '/images/services/iac-hero.jpg',
    icon: 'code',
    size: 'sm',
    hover: 'gradient',
  },
  {
    title: 'Mobile apps',
    body: 'Native and cross-platform apps for iOS and Android.',
    href: '/application-development/mobile-app',
    image: '/images/services/mobile-app-hero.jpg',
    size: 'tall',
    hover: 'zoom',
  },
  {
    title: 'Web development',
    body: 'Custom web and mobile apps for every industry: e-commerce, healthcare, education, finance and more.',
    href: '/application-development/web-development',
    image: '/images/platforms/webdev-hero.jpg',
    icon: 'browser',
    size: 'md',
    hover: 'gradient',
  },
  {
    title: 'Containers & monitoring',
    body: 'Docker, Kubernetes and 24/7 observability.',
    href: '/managed-cloud-service/containerization',
    image: '/images/services/containerization-hero.jpg',
    icon: 'container',
    size: 'sm',
    hover: 'spin',
  },
  {
    title: 'Branding & digital marketing',
    body: 'Grow your brand with branding, digital marketing, and scalable outsourcing solutions, from identity design to dedicated teams.',
    href: '/digital-growth',
    image: '/images/services/digital-marketing-hero.jpg',
    size: 'wide',
    hover: 'zoom',
  },
] as const;

/** Section 5 — pinned story: how an engagement runs, from the service pages and FAQs. */
export const chapters = [
  {
    index: '01',
    title: 'Free consultation',
    body: 'We start by understanding your goals and constraints, then send a detailed proposal within 24–48 hours.',
    href: '/contact',
    cta: 'Book a consultation',
    video: '/videos/outsource.mp4',
    poster: '/images/posters/outsource.webp',
  },
  {
    index: '02',
    title: 'Design before code',
    body: 'Wireframes, prototypes and high-fidelity designs in Figma, agreed with you before development begins.',
    href: '/application-development',
    cta: 'Explore app development',
    video: '/videos/application2.mp4',
    poster: '/images/posters/application2.webp',
  },
  {
    index: '03',
    title: 'Build in sprints',
    body: 'An agile process with a working build every two weeks, so you see progress early and steer it.',
    href: '/application-development/web-development',
    cta: 'See what we build',
    video: '/videos/aiml3.mp4',
    poster: '/images/posters/aiml3.webp',
  },
  {
    index: '04',
    title: 'Run and scale',
    body: '24/7 monitoring by senior engineers, not tier-1 ticket handlers. Average response time: 15 minutes.',
    href: '/managed-cloud-service',
    cta: 'Explore managed cloud',
    video: '/videos/cloudvideo-compressed1.mp4',
    poster: '/images/posters/cloudvideo-compressed1.webp',
  },
]

/** Section 6 — figures from the current sparkcurv.com home page. */
export const stats = [
  { value: 30, suffix: '+', label: 'Projects delivered' },
  { value: 98, suffix: '%', label: 'Client satisfaction' },
  { value: 15, suffix: '+', label: 'Team members' },
  { value: 24, suffix: '/7', label: 'Support available' },
];

/**
 * Section 7 — testimonials. SAMPLE CONTENT: the current site has no client quotes,
 * so these are placeholders. Placeholders are never rendered: the section stays hidden
 * until at least one real, approved quote is added here with placeholder: false.
 */
export const testimonials = [
  {
    quote: 'Replace with a real client quote about an AI or automation project you delivered.',
    name: 'Client name',
    role: 'Role, Company',
    placeholder: true,
  },
  {
    quote: 'Replace with a real client quote about a cloud migration or managed infrastructure engagement.',
    name: 'Client name',
    role: 'Role, Company',
    placeholder: true,
  },
  {
    quote: 'Replace with a real client quote about a web or mobile app you built.',
    name: 'Client name',
    role: 'Role, Company',
    placeholder: true,
  },
  {
    quote: 'Replace with a real client quote about branding, marketing or a dedicated team.',
    name: 'Client name',
    role: 'Role, Company',
    placeholder: true,
  },
];

/** Section 8 — CTA slab. The email is posted to POST /api/quick-enquiry. */
export const ctaSlab = {
  eyebrow: 'Start something',
  headline: ["Let's build", 'what’s next.'],
  body: 'Leave your email and our team will get back to you within one business day.',
  button: 'Get in touch',
  success: 'Thanks! We’ll be in touch shortly.',
};

export const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/sparkcurv-technologies/' },
  { label: 'Instagram', href: 'https://www.instagram.com/sparkcurvtechnologies/' },
  { label: 'X', href: 'https://x.com/sparkcurv' },
  { label: 'Facebook', href: 'https://www.facebook.com/people/Sparkcurv-Technologies/61567185115566/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@SparkcurvTechologies' },
] as const;

/** Industries carousel (the "Industries We Serve" block on the web development page). */
export const industries = [
  { name: 'E-commerce', body: 'Online stores, marketplaces and payment gateways.', image: '/images/platforms/ecommerce.jpg' },
  { name: 'Healthcare', body: 'Patient portals, telemedicine and health records.', image: '/images/platforms/healthcare.jpg' },
  { name: 'Education', body: 'Learning management systems, e-learning and student portals.', image: '/images/platforms/education.jpg' },
  { name: 'Finance', body: 'Banking portals, fintech and trading platforms.', image: '/images/platforms/finance.jpg' },
  { name: 'Real estate', body: 'Property listings, virtual tours and CRM.', image: '/images/platforms/realestate.jpg' },
  { name: 'Travel', body: 'Booking engines, travel portals and itinerary apps.', image: '/images/platforms/travel.jpg' },
  { name: 'Food & restaurants', body: 'Online ordering, delivery apps and POS systems.', image: '/images/platforms/food.jpg' },
  { name: 'Logistics', body: 'Fleet management, tracking and warehouse systems.', image: '/images/platforms/logistics.jpg' },
];

/** Why SparkCurv: what every engagement includes (pricing page + FAQs). */
export const differentiators = [
  { title: 'Senior engineers', body: 'Tier-3 support from senior engineers, not tier-1 ticket handlers.' },
  { title: 'One point of contact', body: 'A named technical project manager who knows your business.' },
  { title: 'You own everything', body: 'Your cloud account, your code, your brand assets. Full IP ownership transfers to you.' },
  { title: 'No lock-in', body: 'Ongoing management is month-to-month with 30 days notice.' },
  { title: 'Security first', body: 'Every engagement starts with a full audit of your current environment.' },
  { title: 'Cost-aware', body: 'Proactive reviews to reduce your cloud spend, not grow it.' },
];

/**
 * FAQ: the live home page FAQ (first five, verbatim), then company-level questions from
 * the live pricing and digital growth pages.
 */
export const faqs = [
  {
    q: 'What services does SparkCurv offer?',
    a: 'SparkCurv provides a comprehensive suite of IT services including AI & ML Solutions, Managed Cloud Services, Application Development (Web & Mobile), Digital Marketing, Branding, and IT Outsourcing. We deliver end-to-end technology solutions tailored to your business needs.',
  },
  {
    q: 'How can I get a quote for my project?',
    a: 'Simply visit our Contact page to reach out. Share your project requirements and our team will provide a detailed proposal within 24-48 hours. We offer free initial consultations to understand your needs.',
  },
  {
    q: 'Do you work with startups and enterprises?',
    a: 'Yes, we work with businesses of all sizes — from early-stage startups to established enterprises. Our flexible engagement models allow us to scale our services to match your project scope, budget, and timeline.',
  },
  {
    q: 'Where is SparkCurv located?',
    a: 'We’re based in Nagercoil, Tamil Nadu. We serve clients globally and offer both on-site and remote engagement models.',
  },
  {
    q: 'What industries do you serve?',
    a: 'We serve a wide range of industries including E-commerce, Healthcare, Education, Finance, Real Estate, Travel, Food & Restaurant, Logistics, and more. Our cross-industry experience enables us to deliver domain-specific solutions.',
  },
  {
    q: 'Who owns the cloud account and the code?',
    a: 'You do. If you don’t have a cloud account we set one up and transfer ownership to you, and full IP ownership of what we build transfers to you.',
  },
  {
    q: 'What contract terms are required?',
    a: 'Ongoing management is month-to-month with 30 days notice. New architecture build-outs run 6 to 12 months depending on complexity. There is no lock-in for standard management.',
  },
];

/** Marquee band: technologies used across the service pages. */
export const marqueeWords = [
  'AWS',
  'Kubernetes',
  'Terraform',
  'React',
  'Next.js',
  'Flutter',
  'TensorFlow',
  'PyTorch',
  'Azure',
  'Docker',
  'PostgreSQL',
  'Google Cloud',
  'Figma',
  'Python',
]

/**
 * Partners strip (the live home page's "We're Working With"). Logos in public/images/partners.
 * `tile` is for a logo drawn on its own coloured background: the tile takes that colour.
 */
export const partners = [
  { name: 'SA Renew', logo: '/images/partners/sa-renew.webp', tile: '#071813' },
  { name: 'Softean', logo: '/images/partners/softean.webp' },
  { name: 'Resonacle', logo: '/images/partners/resonacle.webp' },
  { name: 'Kallardo', logo: '/images/partners/kallardo.webp' },
  { name: 'RRB Construction', logo: '/images/partners/rrb-construction.webp' },
  { name: 'DevDukes', logo: '/images/partners/devdukes.webp' },
];
