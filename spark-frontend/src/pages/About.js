import { Mail, Target, Eye, Users, Briefcase, Award, Clock } from 'lucide-react';
import FAQSection from '../components/FAQSection';
import SEO from '../components/SEO';

const About = () => {
  const teamMembers = [
    {
      name: 'Ponish Jino',
      role: 'Founder & CEO',
      image: '/images/team/mem-2.png',
    },
    {
      name: 'Arun kumar',
      role: 'Co-founder & CFO',
      image: '/images/team/mem-1.png',
    },
    {
      name: 'Veera Sarma',
      role: 'Technical Lead',
      image: '/images/team/mem-3.png',
    },
    {
      name: 'Anu Sreekumar',
      role: 'Business Development Executive',
      image: '/images/team/mem-5.png',
    },
  ];

  const stats = [
    { number: '20+', label: 'Happy Clients', icon: Users },
    { number: '27+', label: 'Projects Delivered', icon: Briefcase },
    { number: '15+', label: 'Team Members', icon: Award },
    { number: '2+', label: 'Years of Business', icon: Clock },
  ];

  return (
    <div data-testid="about-page" className="pt-20">
      <SEO
  title="About Us | SparkCurv Technologies"
  description="Learn about SparkCurv Technologies - a passionate IT company in Nagercoil & Bangalore with 15+ professionals delivering AI, cloud, app development, and digital marketing solutions."
  keywords="about SparkCurv, IT company India, technology partner, Nagercoil, Bangalore, software company"
  canonical="https://sparkcurv.com/about"
/>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02028B] to-blue-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-white font-bold">
              About Us
            </p>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-6 text-white animate-slide-up">
            We're <span className="text-gradient-blue">SparkCurv</span>
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            A passionate technology company turning bold ideas into market-ready
            digital solutions. We engineer digital evolution for businesses worldwide.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center reveal-on-scroll hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-[#02028B]" />
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold text-[#02028B]">
                  {stat.number}
                </h3>

                <p className="text-gray-600 text-sm font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="reveal-on-scroll from-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The SparkCurv <span className="text-gradient-blue">Story</span>
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              SparkCurv Technologies was founded to help businesses harness the
              power of technology and grow faster in a digital-first world.
            </p>

            <p className="text-gray-600 leading-relaxed mb-4">
              We specialize in AI, Cloud Infrastructure, Application Development,
              Digital Marketing, and IT Outsourcing.
            </p>

            <p className="text-gray-600 leading-relaxed">
              Our consultative approach ensures we understand your challenges and
              build scalable solutions that deliver real business value.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 reveal-on-scroll from-right">
            <div className="bg-[#02028B] text-white rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
              <h3 className="text-4xl font-bold">5+</h3>
              <p>Years Experience</p>
            </div>

            <div className="border rounded-2xl p-8 hover:scale-105 transition-transform duration-300 hover:border-[#02028B]/30 hover:shadow-lg">
              <h3 className="text-4xl font-bold text-[#02028B]">27+</h3>
              <p>Projects Delivered</p>
            </div>

            <div className="border rounded-2xl p-8 hover:scale-105 transition-transform duration-300 hover:border-[#02028B]/30 hover:shadow-lg">
              <h3 className="text-4xl font-bold text-[#02028B]">20+</h3>
              <p>Clients</p>
            </div>

            <div className="bg-[#02028B] text-white rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
              <h3 className="text-4xl font-bold">15+</h3>
              <p>Team Members</p>
            </div>
          </div>

        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 reveal-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900">
              Our Vision & <span className="text-gradient-blue">Mission</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border-2 border-blue-100 p-10 lg:p-12 hover:shadow-2xl hover:border-[#02028B]/30 transition-all duration-300 reveal-on-scroll from-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#02028B] to-blue-600 rounded-2xl mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To be a globally recognized technology partner that empowers businesses of all sizes to achieve digital excellence. We envision a world where every business has access to world-class technology solutions that drive innovation, efficiency, and sustainable growth.
              </p>
            </div>

            <div className="bg-white rounded-3xl border-2 border-blue-100 p-10 lg:p-12 hover:shadow-2xl hover:border-[#02028B]/30 transition-all duration-300 reveal-on-scroll from-right">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#02028B] to-blue-600 rounded-2xl mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To deliver cutting-edge, reliable, and scalable technology solutions that transform how businesses operate. We are committed to building long-term partnerships and combining technical expertise with creative thinking to turn ambitious ideas into market-ready digital products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <h2 className="text-4xl font-bold text-center mb-16 reveal-on-scroll">
            Meet the <span className="text-gradient-blue">Team</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`text-center group reveal-on-scroll delay-${index + 1}`}
              >
                <div className="w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full border-4 border-transparent group-hover:border-[#02028B]/30 transition-all duration-300 group-hover:shadow-xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-[#02028B]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50 text-center reveal-on-scroll scale-up">
        <h2 className="text-4xl font-bold mb-4">
          Join Our Team
        </h2>

        <p className="text-gray-600 mb-8">
          We're always looking for talented people.
        </p>

        <a
          href="mailto:sales@sparkcurv.com"
          className="inline-flex items-center gap-2 bg-[#02028B] text-white px-8 py-4 rounded-full hover:shadow-xl hover:shadow-[#02028B]/30 transition-all duration-300 transform hover:scale-105"
        >
          <Mail className="w-5 h-5" />
          Get in Touch
        </a>
      </section>

      <FAQSection
        faqs={[
          {
            question: "When was SparkCurv founded?",
            answer: "SparkCurv was founded to deliver cutting-edge digital solutions."
          },
          {
            question: "What services does SparkCurv offer?",
            answer: "Cloud, DevOps, AI, App Development, Digital Marketing."
          },
          {
            question: "Where are you located?",
            answer: "Nagercoil & Bangalore."
          }
        ]}
      />

    </div>
  );
};

export default About;