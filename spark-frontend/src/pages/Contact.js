import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    whatsapp: '',
    services: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const serviceOptions = [
    'AI & ML Services',
    'Managed Cloud Services',
    'Application Development',
    'Digital Grouth & Outsourcing',
    'CI/CD automation',
    'Database Management',
    '24/7 Monitoring Support',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      const count = words.length;
      
      if (count <= 200) {
        setFormData({ ...formData, [name]: value });
        setWordCount(count);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate word count
    const words = formData.description.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) {
      toast.error('Please enter a description');
      return;
    }
    
    setSubmitting(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Thank you! Your enquiry has been sent successfully.');
      setFormData({ 
        name: '', 
        email: '', 
        mobile: '', 
        whatsapp: '', 
        services: '', 
        description: '' 
      });
      setWordCount(0);
      navigate('/thank-you');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page" className="pt-20">
     <SEO
  title="Contact SparkCurv | Get a Free IT Consultation & Project Quote"
  description="Contact SparkCurv Technologies for web development, mobile app development, cloud services, AI solutions, and digital marketing services. Get a free consultation from our experts today."
  keywords="contact SparkCurv, IT consultation, software development company, hire developers, get project quote, web development company, mobile app development company, AI consulting, cloud services company, Nagercoil, Bangalore"
  canonical="https://sparkcurv.com/contact"
/>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02028B] to-blue-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-white font-bold">Get In Touch</p>
          </div>
          <h1 className="font-clash text-5xl sm:text-6xl font-bold tracking-tighter mb-6 text-white animate-slide-up">
            Let's Work Together
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Have a project in mind? We'd love to hear from you. Send us your enquiry and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="reveal-on-scroll from-left">
              <h2 className="font-clash text-3xl font-bold mb-8 text-gray-900">Contact Information</h2>
              <div className="space-y-8">
                {/* Main Branch - Nagercoil */}
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#02028B]" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold mb-2 text-lg">Main Branch - Nagercoil</h3>
                      <p className="text-gray-600 leading-relaxed">
                        64/3 Thompson  street, Palace Road,<br />
                        Nagercoil, Tamil Nadu 629001
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sales Office - Bangalore */}
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#02028B]" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold mb-2 text-lg">Sales Office - Bangalore</h3>
                      <p className="text-gray-600 leading-relaxed">
                        BMTC Complex, Outer Ring Rd,<br />
                        Bengaluru, Karnataka 560068
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#02028B]" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-1">Email</h3>
                      <a
                        href="mailto:sales@sparkcurv.com"
                        className="text-gray-600 hover:text-[#02028B] transition-colors"
                      >
                        sales@sparkcurv.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#02028B]" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-1">Phone</h3>
                      <a
                        href="tel:+919043765028"
                        className="text-gray-600 hover:text-[#02028B] transition-colors"
                      >
                        +91 9043765028
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 p-8 rounded-3xl reveal-on-scroll from-right">
              <h3 className="font-clash text-2xl font-bold mb-6 text-gray-900">Send Enquiry</h3>
              <form onSubmit={handleSubmit} data-testid="contact-form">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      data-testid="contact-input-name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#02028B] focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      data-testid="contact-input-email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#02028B] focus:outline-none transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      data-testid="contact-input-mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      pattern="[0-9+\-\s()]*"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#02028B] focus:outline-none transition-colors"
                      placeholder="+91 1234567890"
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp <span className="text-red-500"></span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      data-testid="contact-input-whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      pattern="[0-9+\-\s()]*"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#02028B] focus:outline-none transition-colors"
                      placeholder="+91 1234567890"
                    />
                  </div>

                  <div>
                    <label htmlFor="services" className="block text-sm font-semibold text-gray-700 mb-2">
                      Services Interested <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="services"
                      name="services"
                      data-testid="contact-input-services"
                      value={formData.services}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#02028B] focus:outline-none transition-colors"
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map((service, index) => (
                        <option key={index} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500"></span>
                      <span className="text-gray-500 font-normal ml-2">({wordCount}/200 words)</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      data-testid="contact-input-description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#02028B] focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about your project... (Maximum 200 words)"
                    />
                    {wordCount >= 180 && (
                      <p className={`text-sm mt-1 ${wordCount >= 200 ? 'text-red-500' : 'text-orange-500'}`}>
                        {wordCount >= 200 ? 'Maximum word limit reached' : `${200 - wordCount} words remaining`}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    data-testid="contact-submit-button"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#02028B] to-blue-600 text-white hover:shadow-xl hover:shadow-[#02028B]/30 transition-all duration-300 rounded-full px-8 py-4 font-bold inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                  >
                    {submitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Enquiry</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;