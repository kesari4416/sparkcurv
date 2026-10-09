import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Services from './pages/Services';
import ManagedCloudService from './pages/ManagedCloudService';
import ApplicationDevelopment from './pages/ApplicationDevelopment';
import DigitalGrowth from './pages/DigitalGrowth';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import PageTransition from './components/PageTransition';
import ThankYou from './pages/ThankYou';
import About from './pages/About';
import Pricing from './pages/Pricing';
import ChatBot from './components/ChatBot';
import SplashScreen from './components/SplashScreen';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedAdmin({ children }) {
  const { admin } = useAuth();
  if (admin === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#02028B]/20 border-t-[#02028B] rounded-full animate-spin" />
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const isThankYou = location.pathname === '/thank-you';
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {!isThankYou && <Navigation />}
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-ml" element={<Services service="ai-ml" />} />
          <Route path="/managed-cloud-service" element={<ManagedCloudService />} />
          <Route path="/managed-cloud-service/:subpage" element={<ManagedCloudService />} />
          <Route path="/application-development" element={<ApplicationDevelopment />} />
          <Route path="/application-development/:subpage" element={<ApplicationDevelopment />} />
          <Route path="/digital-growth" element={<DigitalGrowth />} />
          <Route path="/digital-growth/:subpage" element={<DigitalGrowth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </PageTransition>
      {!isThankYou && <Footer />}
      {!isThankYou && <WhatsAppButton />}
    </>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const isAdmin = window.location.pathname.startsWith('/admin');

  // Skip splash screen entirely for admin routes
  if (isAdmin) {
    return (
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="App">
            <AnimatePresence>
              {showSplash && (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              )}
            </AnimatePresence>
            {!showSplash && <AppContent />}
          </div>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
