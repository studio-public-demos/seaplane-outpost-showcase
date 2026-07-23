import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { restaurants } from '../data/demo';
import type { Order, Address } from '../types';
import { defaultAddresses } from '../data/demo';

export default function CheckoutPage() {
  const { state, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<Address>(defaultAddresses[0]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPlacing, setIsPlacing] = useState(false);

  const restaurant = restaurants.find((r) => r.id === state.items[0]?.restaurantId);

  if (state.items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  const deliveryFee = restaurant?.deliveryFee ?? 2.99;
  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: state.items,
      restaurantId: restaurant?.id ?? '',
      restaurantName: restaurant?.name ?? '',
      restaurantImage: restaurant?.image ?? '',
      status: 'confirmed',
      total: grandTotal,
      deliveryFee,
      deliveryAddress: selectedAddress,
      paymentMethod,
      createdAt: new Date(),
      estimatedDelivery: restaurant?.deliveryTime ?? '30-40 min',
      trackingUpdates: [
        { status: 'confirmed', timestamp: new Date(), message: 'Order confirmed' },
      ],
    };

    const orders = JSON.parse(localStorage.getItem('quickbite_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('quickbite_orders', JSON.stringify(orders));

    setTimeout(() => {
      clearCart();
      navigate(`/order/${order.id}`, { replace: true });
    }, 1500);
  };

  return (
    <div className="max-w-lg mx-auto pb-6">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">Delivery Address</h3>
          <div className="space-y-2">
            {defaultAddresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddress(addr)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  selectedAddress.id === addr.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{addr.label === 'Home' ? '🏠' : '💼'}</span>
                  <span className="font-semibold text-sm">{addr.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">Payment Method</h3>
          <div className="space-y-2">
            {[
              { id: 'card', label: '💳 Credit/Debit Card' },
              { id: 'upi', label: '📱 UPI' },
              { id: 'cod', label: '💵 Cash on Delivery' },
            ].map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  paymentMethod === pm.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-sm">{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
          {state.items.map((ci) => (
            <div key={ci.menuItem.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-500 truncate flex-1">
                {ci.quantity}× {ci.menuItem.name}
              </span>
              <span className="font-medium ml-2">${(ci.menuItem.price * ci.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="w-full bg-red-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-red-600 active:scale-[0.98] transition-all shadow-md shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPlacing ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Placing order...
            </>
          ) : (
            `Place Order · $${grandTotal.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
}
