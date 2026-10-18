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
  salesOffice: 'Sales office: Bangalore, Karnataka',
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
  { label: 'Offices', value: 'Nagercoil · Bangalore' },
];

/** Main navigation (home header + footer). All paths are live routes. */
export const nav = [
  { label: 'AI & ML', href: '/ai-ml' },
  { label: 'Cloud', href: '/managed-cloud-service' },
  { label: 'Apps', href: '/application-development' },
  { label: 'Growth', href: '/digital-growth' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

/** Section 4 — bento grid. `size` drives the asymmetric layout (see sections/FeatureBento). Every tile has a photo; small tiles also carry an icon. */
export const features = [
  {
    title: 'AI & ML services',
    body: 'Intelligent automation and predictive analytics, from proof of concept to production models.',
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
    body: 'Custom web platforms for e-commerce, healthcare, education, finance and more.',
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
    body: 'Identity design and data-driven growth campaigns.',
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

/** FAQ (company-level questions from the home, pricing and digital growth pages). */
export const faqs = [
  {
    q: 'How do I get a quote for my project?',
    a: 'Visit our contact page and share your requirements. We offer a free initial consultation, and our team sends a detailed proposal within 24–48 hours.',
  },
  {
    q: 'Do you work with startups and enterprises?',
    a: 'Yes, businesses of all sizes, from early-stage startups to established enterprises. Our engagement models scale to your scope, budget and timeline.',
  },
  {
    q: 'Do you work with businesses outside India?',
    a: 'Yes. We serve clients globally and work across time zones, with flexible hours that overlap with US, European and APAC teams.',
  },
  {
    q: 'Who owns the cloud account and the code?',
    a: 'You do. If you don’t have a cloud account we set one up and transfer ownership to you, and full IP ownership of what we build transfers to you.',
  },
  {
    q: 'What contract terms are required?',
    a: 'Ongoing management is month-to-month with 30 days notice. New architecture build-outs run 6 to 12 months depending on complexity. There is no lock-in for standard management.',
  },
  {
    q: 'Where is SparkCurv located?',
    a: 'Our main branch is in Nagercoil, Tamil Nadu, with a sales office in Bangalore, Karnataka. We work with clients on-site and remotely.',
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
