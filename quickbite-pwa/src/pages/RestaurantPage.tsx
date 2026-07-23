import { useParams, Link, useNavigate } from 'react-router-dom';
import { restaurants, menuItems } from '../data/demo';
import { useCart } from '../context/CartContext';
import type { MenuItem } from '../types';
import { useState, useMemo } from 'react';

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();

  const restaurant = restaurants.find((r) => r.id === id);
  const items = useMemo(() => menuItems.filter((m) => m.restaurantId === id), [id]);

  const categories = useMemo(
    () => [...new Set(items.map((m) => m.category))],
    [items]
  );

  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  if (!restaurant) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-4">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-lg font-bold text-gray-700">Restaurant not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-red-500 font-medium">
          Go back home
        </button>
      </div>
    );
  }

  const filteredItems = items.filter((m) => m.category === activeCategory);

  return (
    <div className="max-w-lg mx-auto">
      {/* Restaurant Header */}
      <div className="relative h-48">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-sm text-white/80 mt-0.5">{restaurant.description}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/90">
            <span>★ {restaurant.rating} ({restaurant.ratingCount})</span>
            <span>{restaurant.deliveryTime}</span>
            <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
          </div>
          <div className="flex gap-2 mt-2">
            {restaurant.categories.map((c) => (
              <span key={c} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
            {!restaurant.isOpen && (
              <span className="text-xs bg-red-500/80 px-2 py-0.5 rounded-full">Closed</span>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex overflow-x-auto px-4 py-2 gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-3 space-y-3 mb-4">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onAdd={() => addItem(item, restaurant.id, restaurant.name)} />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center py-8 text-gray-400">No items in this category</p>
        )}
      </div>

      {/* View Cart FAB */}
      {itemCount > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg shadow-red-300 font-semibold text-sm flex items-center gap-2 animate-slide-up"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          View Cart · {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Link>
      )}
    </div>
  );
}

function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <div className="flex gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-sm flex-1">{item.name}</h3>
            {item.isPopular && (
              <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {item.isVegetarian && (
              <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">
                Veg
              </span>
            )}
            <span className="text-[10px] text-gray-400 capitalize">
              {item.spiceLevel} spice
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md shadow-red-200 hover:bg-red-600 active:scale-90 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
