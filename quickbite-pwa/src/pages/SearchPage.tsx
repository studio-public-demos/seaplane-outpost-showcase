import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { restaurants, menuItems } from '../data/demo';
import { useCart } from '../context/CartContext';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [diet, setDiet] = useState<'all' | 'veg'>('all');

  const { addItem, itemCount } = useCart();

  const results = useMemo(() => {
    if (!query.trim()) return { restaurants: [], dishes: [] };

    const q = query.toLowerCase();
    const matchedRestaurants = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.categories.some((c) => c.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q)
    );

    const matchedDishes = menuItems.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    ).filter((m) => diet === 'all' || m.isVegetarian);

    return { restaurants: matchedRestaurants, dishes: matchedDishes };
  }, [query, diet]);

  return (
    <div className="max-w-lg mx-auto pb-6">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setSearchParams({ q: e.target.value })}
            placeholder="Search dishes, restaurants..."
            className="flex-1 bg-transparent outline-none text-sm"
            autoFocus
          />
          {query && (
            <button onClick={() => setSearchParams({})} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {query && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setDiet(diet === 'all' ? 'veg' : 'all')}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                diet === 'veg' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              🥬 Veg only
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 mt-4">
        {!query.trim() ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍜</p>
            <p className="text-gray-500 font-medium">Search for your cravings</p>
            <p className="text-gray-400 text-sm mt-1">Try "pizza", "biryani", or "sushi"</p>
          </div>
        ) : results.restaurants.length === 0 && results.dishes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 font-medium">No results for "{query}"</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <>
            {/* Restaurants */}
            {results.restaurants.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Restaurants</h2>
                <div className="space-y-2">
                  {results.restaurants.map((r) => (
                    <Link
                      key={r.id}
                      to={`/restaurant/${r.id}`}
                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={r.image} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{r.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{r.categories.join(' · ')}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-yellow-500 text-[10px]">★ {r.rating}</span>
                          <span className="text-[10px] text-gray-400">{r.deliveryTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Dishes */}
            {results.dishes.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dishes</h2>
                <div className="space-y-2">
                  {results.dishes.map((item) => {
                    const restaurant = restaurants.find((r) => r.id === item.restaurantId);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <h3 className="font-semibold text-sm flex-1">{item.name}</h3>
                            <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{restaurant?.name}</p>
                          <button
                            onClick={() => restaurant && addItem(item, restaurant.id, restaurant.name)}
                            className="mt-1.5 text-xs font-medium text-red-500 hover:text-red-600 active:scale-95 transition-all"
                          >
                            + Add to cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {itemCount > 0 && (
          <Link
            to="/cart"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg shadow-red-300 font-semibold text-sm animate-slide-up"
          >
            View Cart · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Link>
        )}
      </div>
    </div>
  );
}
