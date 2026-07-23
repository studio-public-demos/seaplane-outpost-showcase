import { useState, useCallback } from 'react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <Loader onLoaded={handleLoaded} />

      <div
        className={`transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Navbar />
        <main>
          <Hero />
          <Menu />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>

      {/* Back to top */}
      <a
        href="#hero"
        className="fixed bottom-6 right-6 z-30 w-12 h-12 bg-saffron/20 hover:bg-saffron/30 backdrop-blur-lg border border-saffron/30 rounded-full flex items-center justify-center text-saffron transition-all duration-300 hover:scale-110 shadow-lg shadow-saffron/10"
        aria-label="Back to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </a>
    </>
  );
}
