import { Mail, Linkedin } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: 'Arun Kumar',
      role: 'Founder & CEO',
      image: '/images/team/member-5.jpg',
    },
    {
      name: 'Ponish Jino',
      role: 'Devops Consultant',
      image: '/images/team/member-5.jpg',
    },
    {
      name: 'Veera sarma',
      role: 'Technical Lead',
      image: '/images/team/member-5.jpg',
    },
    {
      name: 'Jeffery John',
      role: 'Senior BDE',
      image: '/images/team/member-5.jpg',
    },
  ];

  return (
    <div data-testid="team-page" className="pt-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02028B] to-blue-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white font-bold">
              Our Team
            </p>
          </div>

          <h1 className="font-clash text-5xl sm:text-6xl font-bold tracking-tighter mb-6 text-white">
            Meet the Team
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Our executive team combines decades of technical expertise and business leadership to deliver innovative solutions.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                data-testid={`team-member-${index}`}
                className="text-center group transition-all duration-500 hover:-translate-y-2"
              >
                
                {/* IMAGE DESIGN */}
                <div className="relative mb-6 flex justify-center">
                  
                  {/* Gradient Ring */}
                  <div className="p-[4px] rounded-full bg-gradient-to-tr from-[#02028B] to-blue-400 shadow-lg">
                    
                    {/* Image */}
                    <div className="rounded-full overflow-hidden bg-white">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-40 h-40 md:w-44 md:h-44 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-300" />
                </div>

                {/* NAME */}
                <h3 className="font-clash text-xl font-bold mb-2 text-gray-900">
                  {member.name}
                </h3>

                {/* ROLE */}
                <p className="text-[#02028B] font-semibold text-sm mb-4">
                  {member.role}
                </p>
              </div>
            ))}
          </div>

          {/* Join CTA */}
          <div className="mt-24 text-center bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-3xl p-12 lg:p-16">
            
            <h2 className="font-clash text-4xl font-bold mb-4 text-gray-900">
              Join Our Team
            </h2>

            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-lg">
              We're always looking for talented individuals who are passionate about technology and innovation. If you're ready to make an impact, we'd love to hear from you.
            </p>

            <a
              href="mailto:sales@sparkcurv.com?subject=Career Opportunity"
              data-testid="join-team-cta"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#02028B] to-blue-600 text-white hover:shadow-xl hover:shadow-[#02028B]/30 transition-all duration-300 rounded-full px-10 py-5 font-bold text-lg transform hover:scale-105"
            >
              <Mail className="w-6 h-6" />
              <span>Get in Touch</span>
            </a>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;