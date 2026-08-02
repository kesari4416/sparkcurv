import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const pageRef = useRef(null);

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);

    // Trigger page entrance animation
    const el = pageRef.current;
    if (el) {
      el.classList.remove('page-enter-active');
      void el.offsetWidth; // force reflow
      el.classList.add('page-enter-active');
    }

    // Scroll reveal observer
    const observerOptions = {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Wait a tick for DOM to render, then observe
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <div ref={pageRef} className="page-enter">
      {children}
    </div>
  );
};

export default PageTransition;
