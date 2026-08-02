import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Zap, Cloud, Code, TrendingUp } from 'lucide-react';

const services = [
  {
    key: 'cloud',
    name: 'Managed Cloud Service',
    icon: Cloud,
    color: '#0284C7',
    lightColor: '#E0F2FE',
    path: '/managed-cloud-service',
    description: 'Scalable, secure, always-on cloud infrastructure.',
    subLinks: [
      { name: 'Overview', path: '/managed-cloud-service' },
      { name: 'Cloud Services', path: '/managed-cloud-service/cloud-services' },
      { name: 'CI/CD Automation', path: '/managed-cloud-service/cicd-automation' },
      { name: 'Infrastructure as Code', path: '/managed-cloud-service/infrastructure-as-code' },
      { name: 'Containerization', path: '/managed-cloud-service/containerization' },
      { name: '24/7 Monitoring', path: '/managed-cloud-service/monitoring' },
      { name: 'Database Management', path: '/managed-cloud-service/database-management' },
    ],
  },
  {
    key: 'app',
    name: 'Application Development',
    icon: Code,
    color: '#059669',
    lightColor: '#D1FAE5',
    path: '/application-development',
    description: 'Pixel-perfect apps for web, mobile, and enterprise.',
    subLinks: [
      { name: 'Overview', path: '/application-development' },
      { name: 'Web Development', path: '/application-development/web-development' },
      { name: 'Mobile App', path: '/application-development/mobile-app' },
    ],
  },
  {
    key: 'growth',
    name: 'Digital Growth & Outsourcing',
    icon: TrendingUp,
    color: '#D97706',
    lightColor: '#FEF3C7',
    path: '/digital-growth',
    description: 'Brand, market, and scale with dedicated remote teams.',
    subLinks: [
      { name: 'Overview', path: '/digital-growth' },
      { name: 'Branding', path: '/digital-growth/branding' },
      { name: 'Digital Marketing', path: '/digital-growth/digital-marketing' },
      { name: 'Outsourcing', path: '/digital-growth/outsourcing' },
    ],
  },
  {
    key: 'ai-ml',
    name: 'AI & ML Services',
    icon: Zap,
    color: '#7C3AED',
    lightColor: '#EDE9FE',
    path: '/ai-ml',
    description: 'Intelligent systems that learn, adapt, and automate.',
    subLinks: [],
  },
];

const simpleNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'About Us', path: '/about' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const ServicesDropdown = ({ isServicesActive }) => {
  const [open, setOpen] = useState(false);
  const [activeService, setActiveService] = useState(services[0].key);
  const ref = useRef(null);
  const location = useLocation();
  const active = services.find((s) => s.key === activeService);

  useEffect(() => {
    const matched = services.find(
      (s) => location.pathname === s.path || location.pathname.startsWith(s.path + '/')
    );
    if (matched) setActiveService(matched.key);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="nav-services-trigger"
        onClick={() => setOpen((p) => !p)}
        className={`px-3 py-1.5 rounded-full font-inter text-[13px] font-medium transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 ${
          isServicesActive || open
            ? 'text-[#02028B] bg-blue-50'
            : 'text-gray-700 hover:text-[#02028B] hover:bg-blue-50/60'
        }`}
      >
        <span>Services</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex">
          <div className="w-[200px] flex-shrink-0 bg-[#02028B] flex flex-col py-3">
            {services.map((s) => {
              const Icon = s.icon;
              const isActive = activeService === s.key;
              return (
                <button
                  key={s.key}
                  onMouseEnter={() => setActiveService(s.key)}
                  onClick={() => setActiveService(s.key)}
                  className="w-full text-left"
                >
                  <div
                    className={`mx-3 my-0.5 px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-150 ${
                      isActive ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[12px] font-semibold font-inter leading-tight">{s.name}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 text-white/60" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: active.lightColor }}
              >
                <active.icon className="w-4 h-4" style={{ color: active.color }} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900 font-inter leading-tight">{active.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{active.description}</p>
              </div>
            </div>

            <div className="flex-1 px-4 py-3 space-y-0.5">
              {active.subLinks.length > 0 ? (
                active.subLinks.map((sub) => {
                  const isCurrentPath = location.pathname === sub.path;
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium font-inter transition-all group ${
                        isCurrentPath ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={isCurrentPath ? { backgroundColor: active.color } : {}}
                    >
                      <span>{sub.name}</span>
                      <ChevronRight className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 ${isCurrentPath ? 'text-white/70' : 'text-gray-300 group-hover:text-gray-400'}`} />
                    </Link>
                  );
                })
              ) : (
                <Link
                  to={active.path}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium font-inter text-white"
                  style={{ backgroundColor: active.color }}
                >
                  <span>Explore {active.name}</span>
                  <ChevronRight className="w-3 h-3 text-white/70" />
                </Link>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <Link
                to="/contact"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#02028B] text-white text-[12px] font-semibold font-inter hover:bg-[#0303b5] transition-colors"
              >
                Start a Project
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileServiceItem = ({ s, currentPath, onNavigate }) => {
  const isPathActive = currentPath === s.path || currentPath.startsWith(s.path + '/');
  const [mobileOpen, setMobileOpen] = useState(isPathActive);
  const Icon = s.icon;

  return (
    <div>
      <button
        onClick={() => setMobileOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-inter font-semibold text-[13px] transition-colors ${
          isPathActive ? 'text-[#02028B] bg-blue-50' : 'text-gray-700 hover:text-[#02028B] hover:bg-blue-50/50'
        }`}
      >
        <span className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: s.lightColor }}>
            <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
          </div>
          {s.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
      </button>

      {mobileOpen && (
        <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l-2 border-gray-100 pl-4">
          {s.subLinks.length > 0 ? (
            s.subLinks.map((sub) => (
              <Link
                key={sub.path}
                to={sub.path}
                onClick={onNavigate}
                className={`block px-3 py-2.5 rounded-lg text-[13px] font-medium font-inter transition-colors ${
                  currentPath === sub.path ? 'text-[#02028B] bg-blue-50' : 'text-gray-500 hover:text-[#02028B] hover:bg-blue-50/50'
                }`}
              >
                {sub.name}
              </Link>
            ))
          ) : (
            <Link
              to={s.path}
              onClick={onNavigate}
              className="block px-3 py-2.5 rounded-lg text-[13px] font-medium font-inter text-gray-500 hover:text-[#02028B] hover:bg-blue-50/50"
            >
              Explore {s.name}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const isServicesActive = services.some(
    (s) => location.pathname === s.path || location.pathname.startsWith(s.path + '/')
  );

  const linkBase = 'text-gray-700 hover:text-[#02028B] hover:bg-blue-50/60';
  const linkActive = 'text-[#02028B] bg-blue-50';

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <nav
          data-testid="main-navigation"
          className="w-full max-w-[1100px]"
          style={{
            borderRadius: '999px',
            background: 'rgba(255,255,255,1)',
            boxShadow: '0 4px 32px rgba(2,2,139,0.10)',
            border: '1px solid rgba(2,2,139,0.08)',
          }}
        >
          <div className="flex items-center justify-between h-[56px] px-4 lg:px-5">
            <Link
              to="/"
              data-testid="logo-link"
              className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src="/images/logo/sparkcurv1.png"
                alt="SparkCurv"
                style={{ width: '140px', height: 'auto', mixBlendMode: 'multiply' }}
              />
            </Link>

            <div className="hidden lg:flex items-center gap-0.5 mx-auto">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-full font-inter text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                  location.pathname === '/' ? linkActive : linkBase
                }`}
              >
                Home
              </Link>

              <ServicesDropdown isServicesActive={isServicesActive} />

              {simpleNavLinks
                .filter((link) => link.name !== 'Home')
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-full font-inter text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                      location.pathname === link.path ? linkActive : linkBase
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
            </div>

            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-full transition-colors text-gray-700 hover:bg-gray-100"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      {isOpen && (
        <div
          data-testid="mobile-menu"
          className="fixed top-[76px] left-4 right-4 z-40 lg:hidden bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[80vh] overflow-y-auto"
        >
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl font-inter font-medium text-[14px] transition-colors ${
                location.pathname === '/' ? 'text-[#02028B] bg-blue-50' : 'text-gray-700 hover:text-[#02028B] hover:bg-blue-50/50'
              }`}
            >
              Home
            </Link>

            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                Services
              </p>
              {services.map((s) => (
                <MobileServiceItem
                  key={s.key}
                  s={s}
                  currentPath={location.pathname}
                  onNavigate={() => setIsOpen(false)}
                />
              ))}
            </div>

            {simpleNavLinks
              .filter((link) => link.name !== 'Home')
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-inter font-medium text-[14px] transition-colors ${
                    location.pathname === link.path ? 'text-[#02028B] bg-blue-50' : 'text-gray-700 hover:text-[#02028B] hover:bg-blue-50/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;