import { useEffect, useRef, useState } from 'react';
import { restaurantInfo } from '../data/menu';

export default function About() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-spice via-crimson/5 to-dark-spice" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-saffron/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual */}
          <div
            className={`order-1 transition-all duration-1000 ${
              visible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
            }`}
          >
            <div className="relative max-w-[320px] mx-auto">
              {/* Decorative cards */}
              <div className="glass-panel p-6 sm:p-8 text-center relative z-10">
                <div className="text-6xl sm:text-8xl mb-4">🍲</div>
                <p className="text-xl sm:text-2xl font-display font-bold gradient-text mb-2">
                  60+ Years
                </p>
                <p className="text-white/40 text-xs sm:text-sm">of biryani mastery</p>
              </div>

              {/* Floating stats */}
              <div className="absolute -top-4 -right-2 sm:-top-8 sm:-right-4 glass-panel px-4 sm:px-6 py-3 sm:py-4 text-center animate-float z-20">
                <p className="text-saffron text-lg sm:text-2xl font-bold">500K+</p>
                <p className="text-white/40 text-[10px] sm:text-xs">Biryanis Served</p>
              </div>
              <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-4 glass-panel px-4 sm:px-6 py-3 sm:py-4 text-center animate-float-delayed z-20">
                <p className="text-saffron text-lg sm:text-2xl font-bold">27</p>
                <p className="text-white/40 text-[10px] sm:text-xs">Secret Spices</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`order-2 transition-all duration-1000 delay-300 ${
              visible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}
          >
            <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3">
              Our Heritage
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-6">
              The Art of Dum Pukht
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-6">
              {restaurantInfo.description}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-saffron mt-1">✦</span>
                <p className="text-white/40 text-sm">
                  <strong className="text-white/60">Hand-ground spices</strong> — roasted daily
                  in our kitchen using a traditional stone grinder
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-saffron mt-1">✦</span>
                <p className="text-white/40 text-sm">
                  <strong className="text-white/60">Aged basmati rice</strong> — sourced from the
                  Himalayan foothills, aged for 2 years
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-saffron mt-1">✦</span>
                <p className="text-white/40 text-sm">
                  <strong className="text-white/60">Dough-sealed pots</strong> — each biryani is
                  sealed and slow-cooked for 4 hours
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-saffron mt-1">✦</span>
                <p className="text-white/40 text-sm">
                  <strong className="text-white/60">Saffron from Kashmir</strong> — the finest
                  strands infused in warm milk
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="text-saffron text-3xl font-bold font-display">4.8</p>
                <p className="text-white/30 text-xs">★★★★★ Google Rating</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-saffron text-3xl font-bold font-display">12K+</p>
                <p className="text-white/30 text-xs">Happy Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
