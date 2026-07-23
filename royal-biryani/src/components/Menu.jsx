import { useEffect, useRef, useState } from 'react';
import { menuItems, sideItems } from '../data/menu';

function SpiceIndicator({ level }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs transition-colors ${i <= level ? 'text-red-500' : 'text-white/20'}`}
        >
          🌶
        </span>
      ))}
    </div>
  );
}

function MenuCard({ item, index }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`glass-panel p-6 md:p-8 card-hover transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Badge */}
      {item.badge && (
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-saffron/20 text-saffron rounded-full mb-4">
          {item.badge}
        </span>
      )}

      {/* Image placeholder */}
      <div className="text-6xl mb-4 text-center">{item.image}</div>

      {/* Content */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-display font-bold text-white/90">{item.name}</h3>
      </div>

      <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-3">
        {item.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-saffron font-bold text-2xl font-display">₹{item.price}</span>
          {item.price >= 1099 && (
            <span className="text-white/30 text-xs ml-1">/serves 4</span>
          )}
        </div>
        <SpiceIndicator level={item.spiciness} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <button className="w-full py-3.5 rounded-xl bg-saffron/10 hover:bg-saffron/20 active:bg-saffron/30 text-saffron font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[48px]">
          Add to Order
        </button>
      </div>
    </div>
  );
}

export default function Menu() {
  const titleRef = useRef(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="menu" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-spice via-amber-950/10 to-dark-spice" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          ref={titleRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3">Our Signature</p>
          <h2 className="section-title gradient-text">The Royal Menu</h2>
          <p className="text-white/40 mt-4 max-w-2xl mx-auto text-base">
            Every biryani is handcrafted with heirloom spices, sealed in a traditional clay pot,
            and slow-cooked to aromatic perfection.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {menuItems.map((item, i) => (
            <MenuCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Sides */}
        <div
          className={`mt-20 transition-all duration-1000 ${
            titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h3 className="text-2xl font-display font-bold text-center gradient-text mb-8">
            Perfect Accompaniments
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {sideItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-4 text-center card-hover cursor-pointer group"
              >
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">
                  {item.image}
                </div>
                <p className="text-white/70 text-sm font-medium">{item.name}</p>
                <p className="text-saffron/80 text-xs mt-1">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
