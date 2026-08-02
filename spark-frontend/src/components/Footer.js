import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#02028B] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img 
              src="/images/logo/sparkcurv-logo.png" 
              alt="SparkCurv Technologies" 
              className="h-12 w-auto object-contain mb-5 rounded-lg bg-white p-1.5"
            />
            <p className="text-sm text-blue-200 leading-relaxed">
              Turning ideas into digital brilliance. We craft sleek apps, stunning websites, and smart tech solutions to power your success.
            </p>
            <div className="flex items-center space-x-3 mt-6">
              {[
                { Icon: Facebook, url: 'https://www.facebook.com/people/Sparkcurv-Technologies/61567185115566/', label: 'Facebook' },
                { Icon: Twitter, url: 'https://x.com/sparkcurv', label: 'Twitter' },
                { Icon: Instagram, url: 'https://www.instagram.com/sparkcurvtechnologies/', label: 'Instagram' },
                { Icon: Linkedin, url: 'https://www.linkedin.com/company/sparkcurv-technologies/', label: 'LinkedIn' },
                { Icon: Youtube, url: 'https://www.youtube.com/@SparkcurvTechologies', label: 'Youtube' },
              ].map(({ Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`social-link-${label.toLowerCase()}`}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 hover:bg-white/20 hover:text-white transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-white mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Blog', path: '/blog' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    data-testid={`footer-link-${link.name.toLowerCase()}`}
                    className="text-sm text-blue-200 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-white mb-5">Services</h3>
            <ul className="space-y-3">
              {[
                { name: 'AI & ML Services', path: '/ai-ml' },
                { name: 'Managed Cloud', path: '/managed-cloud-service' },
                { name: 'App Development', path: '/application-development' },
                { name: 'Digital Growth', path: '/digital-growth' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    data-testid={`footer-service-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-blue-200 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-white mb-5">Contact</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">Nagercoil</p>
                <p className="text-sm text-blue-200">
                  64/3 Thompson Street, Palace Road,<br />
                  Nagercoil, Tamil Nadu 629001
                </p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">Bangalore</p>
                <p className="text-sm text-blue-200">
                  BMTC Complex, Outer Ring Rd,<br />
                  Bengaluru, Karnataka 560068
                </p>
              </div>

              <div className="flex items-center space-x-3 text-sm pt-1">
                <Mail className="w-4 h-4 flex-shrink-0 text-blue-300" />
                <a href="mailto:sales@sparkcurv.com" className="text-blue-200 hover:text-white transition-colors">
                  sales@sparkcurv.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-blue-300" />
                <a href="tel:+919043765028" className="text-blue-200 hover:text-white transition-colors">
                  +91 9043765028
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-blue-300 text-xs">
            Copyright SparkCurv © 2025. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;