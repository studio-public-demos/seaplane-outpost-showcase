import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { restaurants } from '../data/demo';

export default function CartPage() {
  const { state, updateQuantity, itemCount, total } = useCart();
  const navigate = useNavigate();

  if (state.items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-4">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-lg font-bold text-gray-700">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mt-1">Add some delicious items to get started</p>
        <Link
          to="/"
          className="inline-block mt-5 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const restaurant = restaurants.find((r) => r.id === state.items[0]?.restaurantId);
  const deliveryFee = restaurant?.deliveryFee ?? 2.99;
  const grandTotal = total + deliveryFee;

  return (
    <div className="max-w-lg mx-auto pb-6">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold">Your Cart</h1>
        {restaurant && (
          <p className="text-sm text-gray-500 mt-0.5">From {restaurant.name}</p>
        )}
      </div>

      {/* Cart Items */}
      <div className="px-4 py-3 space-y-2">
        {state.items.map((cartItem) => (
          <div
            key={cartItem.menuItem.id}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={cartItem.menuItem.image}
                alt={cartItem.menuItem.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{cartItem.menuItem.name}</h3>
              <p className="font-bold text-sm mt-0.5">${(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-90 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-6 text-center font-semibold text-sm">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-90 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add more items */}
      {restaurant && (
        <div className="px-4 mb-4">
          <Link
            to={`/restaurant/${restaurant.id}`}
            className="block text-center text-sm text-red-500 font-medium py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            + Add more items from {restaurant.name}
          </Link>
        </div>
      )}

      {/* Order Summary */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({itemCount} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="w-full mt-4 bg-red-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-red-600 active:scale-[0.98] transition-all shadow-md shadow-red-200"
        >
          Proceed to Checkout · ${grandTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
