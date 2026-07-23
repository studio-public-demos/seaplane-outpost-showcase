import { useState, useEffect, useRef } from 'react';
import BiryaniScene from '../three/BiryaniScene';

export default function Loader({ onLoaded }) {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowContent(true), 400);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showContent) onLoaded();
  }, [showContent, onLoaded]);

  if (showContent) return null;

  return (
    <div className="fixed inset-0 z-50 bg-dark-spice flex flex-col items-center justify-center">
      <div className="relative">
        <div className="text-6xl mb-8 animate-float">🍲</div>
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text text-center mb-4">
          Royal Biryani
        </h1>
        <p className="text-saffron/60 text-sm tracking-[0.3em] uppercase text-center mb-8">
          Crafting Your Experience
        </p>
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-saffron to-saffron-dark rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-saffron/40 text-xs text-center mt-3">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>
    </div>
  );
}
