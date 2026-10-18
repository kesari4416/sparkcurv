/**
 * Copy for the company pages (pricing, about, contact). From the live sparkcurv.com pages;
 * edit here, not in the page components.
 */
import type { Faq } from './services';

/* ----- About ------------------------------------------------------------------------- */

export const about = {
  eyebrow: 'About us',
  lead: "We're",
  accent: 'SparkCurv.',
  intro:
    'A passionate technology company turning bold ideas into market-ready digital solutions. We engineer digital evolution for businesses worldwide.',
  /**
   * The live About page says 27+ projects, the home page 30+; this uses 30+ everywhere.
   * Years are left out: the live About page says both "2+ years of business" and
   * "5+ years experience". Confirm both with the team before adding them back.
   */
  stats: [
    { value: '30+', label: 'Projects delivered' },
    { value: '20+', label: 'Happy clients' },
    { value: '15+', label: 'Team members' },
    { value: '98%', label: 'Client satisfaction' },
  ],
  story: [
    'SparkCurv Technologies was founded to help businesses harness the power of technology and grow faster in a digital-first world.',
    'We specialize in AI, Cloud Infrastructure, Application Development, Digital Marketing, and IT Outsourcing.',
    'Our consultative approach ensures we understand your challenges and build scalable solutions that deliver real business value.',
  ],
  vision:
    'To be a globally recognized technology partner that empowers businesses of all sizes to achieve digital excellence. We envision a world where every business has access to world-class technology solutions that drive innovation, efficiency, and sustainable growth.',
  mission:
    'To deliver cutting-edge, reliable, and scalable technology solutions that transform how businesses operate. We are committed to building long-term partnerships and combining technical expertise with creative thinking to turn ambitious ideas into market-ready digital products.',
  team: [
    { name: 'Ponish Jino', role: 'Founder & CEO', image: '/images/team/mem-2.webp' },
    { name: 'Arun Kumar', role: 'Co-founder & CFO', image: '/images/team/mem-1.webp' },
    { name: 'Merbin Bejo', role: 'Project Manager · AI/ML Engineer', image: '/images/team/IMG_4214.webp' },
    { name: 'Anu Sreekumar', role: 'Business Development Executive', image: '/images/team/mem-5.webp' },
  ],
  join: {
    title: 'Join our team',
    body: "We're always looking for talented people.",
  },
  /** The live About FAQ answers are one-liners; these are the fuller answers from the live home page. */
  faqs: [
    { q: 'What services does SparkCurv offer?', a: 'SparkCurv provides a comprehensive suite of IT services including AI & ML Solutions, Managed Cloud Services, Application Development (Web & Mobile), Digital Marketing, Branding, and IT Outsourcing. We deliver end-to-end technology solutions tailored to your business needs.' },
    { q: 'Where is SparkCurv located?', a: 'Our main branch is in Nagercoil, Tamil Nadu, and we have a sales office in Bangalore, Karnataka. We serve clients globally and offer both on-site and remote engagement models.' },
    { q: 'What industries do you serve?', a: 'We serve a wide range of industries including E-commerce, Healthcare, Education, Finance, Real Estate, Travel, Food & Restaurant, Logistics, and more. Our cross-industry experience enables us to deliver domain-specific solutions.' },
    { q: 'Do you work with startups and enterprises?', a: 'Yes, we work with businesses of all sizes — from early-stage startups to established enterprises. Our flexible engagement models allow us to scale our services to match your project scope, budget, and timeline.' },
  ] satisfies Faq[],
};

/* ----- Pricing ----------------------------------------------------------------------- */

export type Plan = {
  name: string;
  /** Monthly price in USD, or null for a custom quote. */
  price: string | null;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export const pricing = {
  eyebrow: 'Managed cloud pricing',
  lead: 'Predictable pricing,',
  accent: 'comprehensive service.',
  intro:
    'Flat monthly rates with no setup fees, no onboarding costs, and no surprises. Plans scale with the complexity of your environment.',
  plans: [
    {
      name: 'Starter',
      price: '349',
      period: 'per month',
      description: 'For smaller environments with straightforward cloud infrastructure needs.',
      features: [
        'Up to 2 environments',
        'Up to 4 compute/DB servers',
        'Professional DevOps Services – 45 hours included',
        'Additional hours: USD 6.00 per hour',
        'VPC design & setup',
        'Cost optimization review',
        'Backup & restore management',
      ],
      cta: 'Get started',
    },
    {
      name: 'Professional',
      price: '699',
      period: 'per month',
      description: 'For growing environments that need CI/CD pipelines, WAF, and container support.',
      features: [
        'Up to 4 environments',
        'Up to 20 compute/DB servers',
        'Professional DevOps Services: 100 hours',
        'Additional support: USD 5.50/hour',
        'CI/CD pipeline design & support',
        'Web Application Firewall (WAF)',
        'Docker & Kubernetes management',
        'Disaster Recovery planning',
        'Dedicated DevOps engineer',
        'Monthly patching',
      ],
      cta: 'Get started',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '1,199',
      period: 'per month',
      description: 'Full-service management with dedicated team, DR, and multi-cloud architecture.',
      features: [
        'Up to 8 environments',
        'Up to 50 compute/DB servers',
        'Dedicated 24×5 SRE team',
        'Weekend on-demand support at USD 5/hour',
        'Multi-cloud architecture',
        'ECS, EKS, AKS orchestration',
        'Technical Account Manager (TAM)',
        'Serverless architecture support',
        'Security & compliance audits',
        'Weekly patching cycles',
      ],
      cta: 'Get started',
    },
    {
      name: 'Enterprise',
      price: null,
      period: 'tailored to your needs',
      description: 'Unlimited scale with compliance support for regulated industries.',
      features: [
        'Unlimited environments',
        'Unlimited servers',
        'On-call escalation support',
        '24/7 dedicated SRE team',
        'Custom SLAs & response times',
        'Dedicated engineering team',
        'Priority incident response',
      ],
      cta: 'Contact us',
    },
  ] satisfies Plan[],
  includes: [
    { title: 'Onboarding & Security Review', body: 'Full audit of your current environment before we begin' },
    { title: '24/7 Tier-3 Support & Monitoring', body: 'Senior engineers, not tier-1 ticket handlers' },
    { title: 'Infrastructure as Code (IaC)', body: 'Terraform, CloudFormation, Ansible automation' },
    { title: 'Named Technical Project Manager', body: 'Single point of contact who knows your business' },
    { title: 'Cost Optimization Reviews', body: 'Proactive recommendations to reduce cloud spend' },
    { title: 'Regular Patching & Updates', body: 'Quarterly or monthly based on your plan' },
  ],
  faqs: [
    { q: 'What is included in the management fee?', a: 'Our management fees cover 24/7 monitoring, infrastructure management, DevOps engineering, security patching, cost optimization, and dedicated support. Your cloud provider costs (compute, storage, bandwidth) are separate and paid directly to AWS/Azure/GCP.' },
    { q: 'Do we still need AWS or Azure Premium Support?', a: 'Most of our clients cancel their Premium Support after working with us. We provide more comprehensive, hands-on engineering support than cloud provider premium tiers offer. Your team can reach us directly via Slack, Teams, or WhatsApp.' },
    { q: 'Who owns the cloud account?', a: 'You own your account. If you do not have one, we will set it up on your behalf and transfer ownership to you. You always retain full control and access to your cloud environment.' },
    { q: 'What is your response time?', a: 'Our average response time is 15 minutes. Formal SLA guarantees range from 1 hour (Starter) to 15 minutes (Enterprise) for first response, with custom SLAs available on Enterprise plans.' },
    { q: 'What contract terms are required?', a: 'Ongoing management is month-to-month with 30 days notice. For new architecture build-outs, terms range from 6 to 12 months depending on complexity. No lock-in for standard management services.' },
  ] satisfies Faq[],
};
