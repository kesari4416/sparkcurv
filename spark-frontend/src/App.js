import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

function AppContent() {
  const location = useLocation();
  const isThankYou = location.pathname === '/thank-you';

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
          <Route path="/about" element={<About />} />  {/* fix: was /About */}
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

  return (
    <HelmetProvider>
      <BrowserRouter>                         {/* moved outside motion wrapper */}
        <div className="App">
          <AnimatePresence>
            {showSplash && (
              <SplashScreen onComplete={() => setShowSplash(false)} />
            )}
          </AnimatePresence>

          {!showSplash && <AppContent />}     {/* render only after splash done */}
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;