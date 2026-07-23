import { useEffect, useRef, useState } from 'react';
import BiryaniScene from '../three/BiryaniScene';

export default function Hero() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const timer = setTimeout(() => {
      if (containerRef.current && !sceneRef.current) {
        try {
          sceneRef.current = new BiryaniScene(containerRef.current);
          setSceneReady(true);
        } catch (err) {
          console.error('Scene init error:', err);
          setWebglSupported(false);
        }
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* 3D Scene container */}
      {webglSupported && (
        <div ref={containerRef} className="absolute inset-0 z-0" />
      )}

      {/* Fallback gradient background */}
      {!webglSupported && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-dark-spice via-amber-950/30 to-dark-spice">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,162,97,0.15)_0%,_transparent_70%)]" />
        </div>
      )}

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-dark-spice/40 via-transparent to-dark-spice pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-dark-spice via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div
          className={`transition-all duration-1000 ${
            sceneReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <p className="text-saffron text-sm md:text-base tracking-[0.4em] uppercase mb-4 font-medium">
            Est. 1962 · Hyderabad
          </p>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black gradient-text leading-none sm:leading-tight mb-6 text-shadow px-2">
            Royal Biryani
          </h1>
          <p className="text-white/60 text-sm sm:text-base md:text-xl font-light max-w-xs sm:max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Where the ancient art of <span className="text-saffron">dum pukht</span> meets royal flavors — sealed, slow-cooked perfection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <a href="#menu" className="btn-primary text-base sm:text-lg w-full sm:w-auto text-center min-h-[48px] flex items-center justify-center">
              Explore Our Menu
            </a>
            <a href="#contact" className="btn-outline text-base sm:text-lg w-full sm:w-auto text-center min-h-[48px] flex items-center justify-center">
              Order Now
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="mt-10 sm:mt-16 animate-bounce">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-saffron/50 mx-auto"
              strokeWidth="1.5"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
