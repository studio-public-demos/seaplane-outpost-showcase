import { useEffect, useRef, useState } from 'react';
import { restaurantInfo } from '../data/menu';

export default function Contact() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [formState, setFormState] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hi Royal Biryani! I'd like to place an order/ask about: ${formState.message}\n\n- ${formState.name}\n- ${formState.phone}`
    );
    window.open(`https://wa.me/${restaurantInfo.social.whatsapp.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-dark-spice via-amber-950/10 to-dark-spice" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3">Get In Touch</p>
          <h2 className="section-title gradient-text">Order Your Biryani</h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto">
            Dine in, take away, or order for delivery. We also cater for weddings and events.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div
            className={`space-y-8 transition-all duration-1000 ${
              visible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
            }`}
          >
            {/* Info cards */}
            <div className="glass-panel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron flex-shrink-0 text-xl">
                📍
              </div>
              <div>
                <h4 className="text-white/80 font-semibold mb-1">Visit Us</h4>
                <p className="text-white/40 text-sm leading-relaxed">{restaurantInfo.address}</p>
              </div>
            </div>

            <div className="glass-panel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron flex-shrink-0 text-xl">
                🕐
              </div>
              <div>
                <h4 className="text-white/80 font-semibold mb-1">Hours</h4>
                <p className="text-white/40 text-sm">{restaurantInfo.hours}</p>
              </div>
            </div>

            <div className="glass-panel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron flex-shrink-0 text-xl">
                📞
              </div>
              <div>
                <h4 className="text-white/80 font-semibold mb-1">Call Us</h4>
                <p className="text-white/40 text-sm">{restaurantInfo.phone}</p>
                <p className="text-white/40 text-sm">{restaurantInfo.email}</p>
              </div>
            </div>

            {/* Quick order */}
            <div className="glass-panel p-6">
              <h4 className="text-white/80 font-semibold mb-4">Instant Order</h4>
              <div className="flex flex-col xs:flex-row gap-3">
                <a
                  href={`https://wa.me/${restaurantInfo.social.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${restaurantInfo.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-saffron/10 hover:bg-saffron/20 text-saffron font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  Call Now
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              visible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}
          >
            <div className="glass-panel p-8">
              <h3 className="text-2xl font-display font-bold gradient-text mb-6">
                Send Us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-white/40 text-sm mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-saffron/50 focus:ring-1 focus:ring-saffron/20 transition-all text-base min-h-[48px]"
                  />
                </div>
                <div>
                    <label className="block text-white/40 text-sm mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-saffron/50 focus:ring-1 focus:ring-saffron/20 transition-all text-base min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-sm mb-2">
                    What would you like?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="e.g., I'd like to order Hyderabadi Dum Biryani for 4 people..."
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-saffron/50 focus:ring-1 focus:ring-saffron/20 transition-all resize-none text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full text-center min-h-[48px]"
                >
                  {submitted ? 'Opening WhatsApp...' : 'Send via WhatsApp'}
                </button>
                <p className="text-white/20 text-xs text-center">
                  Your message will open in WhatsApp for quick ordering
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
