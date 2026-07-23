import { useState } from 'react';
import { Link } from 'react-router-dom';
import { restaurants, categories } from '../data/demo';
import type { Restaurant } from '../types';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = restaurants.filter((r) => {
    if (selectedCategory !== 'all' && !r.categories.includes(selectedCategory)) return false;
    return true;
  });

  const featured = restaurants.filter((r) => r.rating >= 4.4);

  return (
    <div className="max-w-lg mx-auto pb-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-5 py-8">
        <h1 className="text-2xl font-bold mb-1">Hungry? We got you!</h1>
        <p className="text-white/80 text-sm">Order from the best restaurants near you</p>
        <Link
          to="/search"
          className="mt-4 flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search dishes, cuisines, restaurants...
        </Link>
      </div>

      {/* Categories */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-red-500 text-white shadow-md shadow-red-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Restaurants */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">Featured Restaurants</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {featured.map((r) => (
            <Link key={r.id} to={`/restaurant/${r.id}`} className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-32">
                <img src={r.image} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute top-2 left-2 bg-white/90 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {r.deliveryTime}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{r.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500 text-xs">★</span>
                  <span className="text-xs font-medium">{r.rating}</span>
                  <span className="text-xs text-gray-400">({r.ratingCount})</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{r.categories.slice(0, 2).join(' · ')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Restaurants */}
      <section className="px-4">
        <h2 className="text-lg font-bold mb-3">
          {selectedCategory === 'all' ? 'All Restaurants' : `${selectedCategory} Restaurants`}
        </h2>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 font-medium">No restaurants found</p>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="flex gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow"
    >
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" loading="lazy" />
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold">CLOSED</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm truncate">{restaurant.name}</h3>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${restaurant.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-xs font-medium">{restaurant.rating}</span>
          <span className="text-xs text-gray-400">({restaurant.ratingCount})</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{restaurant.categories.join(' · ')}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-500">{restaurant.deliveryTime}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-500">
            {restaurant.deliveryFee === 0 ? 'Free delivery' : `$${restaurant.deliveryFee.toFixed(2)} delivery`}
          </span>
        </div>
      </div>
    </Link>
  );
}
