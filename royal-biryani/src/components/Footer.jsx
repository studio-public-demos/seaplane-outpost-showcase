import { restaurantInfo } from '../data/menu';

export default function Footer() {
  return (
    <footer className="relative pt-12 pb-8 sm:pt-16 sm:pb-10 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍲</span>
              <span className="text-xl font-display font-bold gradient-text">
                Royal Biryani
              </span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Authentic dum biryani crafted with love since 1962. Every pot tells a story.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href={`https://instagram.com/${restaurantInfo.social.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-saffron/20 flex items-center justify-center text-white/40 hover:text-saffron transition-all"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${restaurantInfo.social.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-green-500/20 flex items-center justify-center text-white/40 hover:text-green-400 transition-all"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white/60 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-1">
              {['Home', 'Menu', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-white/30 text-sm hover:text-saffron transition-colors block py-2"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu Highlights */}
          <div>
            <h4 className="text-white/60 font-semibold mb-4">Highlights</h4>
            <ul className="space-y-1">
              <li className="text-white/30 text-sm py-2">Hyderabadi Dum Biryani</li>
              <li className="text-white/30 text-sm py-2">Lucknowi Awadhi Biryani</li>
              <li className="text-white/30 text-sm py-2">Family Biryani Pack</li>
              <li className="text-white/30 text-sm py-2">Event Catering</li>
            </ul>
          </div>

          {/* Newsletter CTA */}
          <div>
            <h4 className="text-white/60 font-semibold mb-4">Stay Updated</h4>
            <p className="text-white/30 text-sm mb-4">Get exclusive offers and new menu alerts.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder-white/20 focus:outline-none focus:border-saffron/50 transition-all"
              />
              <button className="px-5 py-3 bg-saffron/20 hover:bg-saffron/30 active:bg-saffron/40 text-saffron rounded-xl font-semibold text-sm transition-all whitespace-nowrap min-h-[48px]">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Royal Biryani. All rights reserved. Crafted with ❤️ in Hyderabad.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors">Privacy</a>
            <a href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors">Terms</a>
            <a href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
