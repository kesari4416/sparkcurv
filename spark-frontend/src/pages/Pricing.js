import { Link } from 'react-router-dom';
import { Check, ArrowRight, Shield, Clock, Headphones, Server, Database, Activity, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import FAQSection from '../components/FAQSection';

const plans = [
  {
    name: 'Starter',
    price: '349',
    currency: '$',
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
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '699',
    currency: '$',
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
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '1,199',
    currency: '$',
    period: 'per month',
    description: 'Full-service management with dedicated team, DR, and multi-cloud architecture.',
    features: [
      'Up to 8 environments',
      'Up to 50 compute/DB servers',
      'Dedicated 24×5 SRE team',
      'weekend (On-demand support at USD 5/hour)',
      'Multi-cloud architecture',
      'ECS, EKS, AKS orchestration',
      'Technical Account Manager (TAM)',
      'Serverless architecture support',
      'Security & compliance audits',
      'Weekly patching cycles',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    currency: '',
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
    cta: 'Contact Us',
    highlighted: false,
  },
];

const includes = [
  { icon: Shield, title: 'Onboarding & Security Review', desc: 'Full audit of your current environment before we begin' },
  { icon: Headphones, title: '24/7 Tier-3 Support & Monitoring', desc: 'Senior engineers, not tier-1 ticket handlers' },
  { icon: Server, title: 'Infrastructure as Code (IaC)', desc: 'Terraform, CloudFormation, Ansible automation' },
  { icon: Clock, title: 'Named Technical Project Manager', desc: 'Single point of contact who knows your business' },
  { icon: Database, title: 'Cost Optimization Reviews', desc: 'Proactive recommendations to reduce cloud spend' },
  { icon: Activity, title: 'Regular Patching & Updates', desc: 'Quarterly or monthly based on your plan' },
];

const Pricing = () => {
  return (
    <div data-testid="pricing-page" className="pt-20">
      <SEO
  title="Managed Cloud Pricing | DevOps & Cloud Infrastructure Plans | SparkCurv"
  description="Predictable pricing for SparkCurv Managed Cloud Services. Includes 24/7 monitoring, DevOps engineering, CI/CD automation, Kubernetes, and infrastructure management. Plans start from $349/month."
  keywords="managed cloud pricing, cloud services pricing, DevOps pricing, cloud infrastructure cost, AWS managed services pricing, Azure managed services pricing, Kubernetes management cost, CI/CD automation pricing"
  canonical="https://sparkcurv.com/pricing/managed-cloud"
/>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02028B] to-blue-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-white font-bold">
              Managed Cloud Pricing
            </p>
          </div>
          <h1 className="font-clash text-5xl sm:text-6xl font-bold tracking-tighter mb-6 text-white animate-slide-up">
            Predictable Pricing,{' '}
            <span className="text-gradient-blue">Comprehensive Service</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Flat monthly rates with no setup fees, no onboarding costs, and no surprises. Plans scale with the complexity of your environment.
          </p>
        </div>
      </section>

      {/* Every Plan Includes */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 reveal-on-scroll">
            <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-[#CCCCCC]/10 rounded-full px-6 py-2 mb-6">
              <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Every Plan Includes</span>
            </div>
            <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gray-900">Everything You Need to </span>
              <span className="text-gradient-blue">Stop Worrying</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {includes.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`group bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-[#02028B]/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl reveal-on-scroll delay-${(i % 3) + 1}`} data-testid={`includes-item-${i}`}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#02028B]/10 to-blue-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-[#02028B]" />
                  </div>
                  <h3 className="font-clash text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 md:py-32 bg-gray-50" data-testid="pricing-cards-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 reveal-on-scroll">
            <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-[#CCCCCC]/10 rounded-full px-6 py-2 mb-6">
              <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Choose Your Plan</span>
            </div>
            <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gray-900">Plans That Scale </span>
              <span className="text-gradient-blue">With You</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                data-testid={`pricing-card-${plan.name.toLowerCase()}`}
                className={`group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl reveal-on-scroll delay-${(i % 4) + 1} ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-[#02028B] to-[#0044AA] text-white shadow-xl shadow-[#02028B]/20'
                    : 'bg-white border-2 border-gray-100 hover:border-[#02028B]/30'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#F2B035] text-center py-2">
                    <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Most Popular</span>
                  </div>
                )}

                <div className={`p-8 ${plan.highlighted ? 'pt-14' : ''}`}>
                  {/* Plan icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                    plan.highlighted ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-[#02028B]/10 to-blue-50'
                  }`}>
                    <Sparkles className={`w-6 h-6 ${plan.highlighted ? 'text-white' : 'text-[#02028B]'}`} />
                  </div>

                  <h3 className={`font-clash text-2xl font-bold mb-3 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-1">
                    {plan.price !== 'Custom' ? (
                      <span className={`font-clash text-5xl font-bold tracking-tight ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                        {plan.currency}{plan.price}
                      </span>
                    ) : (
                      <span className={`font-clash text-5xl font-bold tracking-tight ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                        Custom
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
                    {plan.period}
                  </p>

                  <p className={`text-sm leading-relaxed mb-8 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.highlighted ? 'bg-white/20' : 'bg-[#02028B]/10'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-[#02028B]'}`} />
                        </div>
                        <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/contact"
                    data-testid={`pricing-cta-${plan.name.toLowerCase()}`}
                    className={`group/btn w-full inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                      plan.highlighted
                        ? 'bg-white text-[#02028B] hover:shadow-white/30'
                        : 'bg-[#02028B] text-white hover:shadow-[#02028B]/30'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={[
        { question: 'What is included in the management fee?', answer: 'Our management fees cover 24/7 monitoring, infrastructure management, DevOps engineering, security patching, cost optimization, and dedicated support. Your cloud provider costs (compute, storage, bandwidth) are separate and paid directly to AWS/Azure/GCP.' },
        { question: 'Do we still need AWS or Azure Premium Support?', answer: 'Most of our clients cancel their Premium Support after working with us. We provide more comprehensive, hands-on engineering support than cloud provider premium tiers offer. Your team can reach us directly via Slack, Teams, or WhatsApp.' },
        { question: 'Who owns the cloud account?', answer: 'You own your account. If you do not have one, we will set it up on your behalf and transfer ownership to you. You always retain full control and access to your cloud environment.' },
        { question: 'What is your response time?', answer: 'Our average response time is 15 minutes. Formal SLA guarantees range from 1 hour (Starter) to 15 minutes (Enterprise) for first response, with custom SLAs available on Enterprise plans.' },
        { question: 'What contract terms are required?', answer: 'Ongoing management is month-to-month with 30 days notice. For new architecture build-outs, terms range from 6 to 12 months depending on complexity. No lock-in for standard management services.' },
      ]} />

    </div>
  );
};

export default Pricing;