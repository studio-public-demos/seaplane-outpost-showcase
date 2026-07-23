import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../types';

const statuses: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'confirmed', label: 'Confirmed', icon: '✅' },
  { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { status: 'picked_up', label: 'Picked Up', icon: '📦' },
  { status: 'delivering', label: 'On the Way', icon: '🛵' },
  { status: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const orders: Order[] = JSON.parse(localStorage.getItem('quickbite_orders') || '[]');
    const found = orders.find((o) => o.id === id);
    if (found) {
      found.createdAt = new Date(found.createdAt);
      found.trackingUpdates = found.trackingUpdates.map((u) => ({
        ...u,
        timestamp: new Date(u.timestamp),
      }));
      setOrder(found);
    }
  }, [id]);

  useEffect(() => {
    if (!order || order.status === 'delivered') return;

    const statusSequence: OrderStatus[] = ['confirmed', 'preparing', 'picked_up', 'delivering', 'delivered'];
    const currentIdx = statusSequence.indexOf(order.status);

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = currentIdx + 1; i < statusSequence.length; i++) {
      const delay = (i - currentIdx) * 8000 + Math.random() * 4000;
      const timer = setTimeout(() => {
        setOrder((prev) => {
          if (!prev) return prev;
          const newStatus = statusSequence[i];
          return {
            ...prev,
            status: newStatus,
            trackingUpdates: [
              ...prev.trackingUpdates,
              { status: newStatus, timestamp: new Date(), message: getMessage(newStatus) },
            ],
          };
        });
      }, delay);
      timers.push(timer);
    }

    return () => timers.forEach(clearTimeout);
  }, [order?.id]);

  useEffect(() => {
    const idx = statuses.findIndex((s) => s.status === order?.status);
    setProgress(idx >= 0 ? idx / (statuses.length - 1) : 0);
  }, [order?.status]);

  if (!order) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-4">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-lg font-bold text-gray-700">Order not found</h2>
        <Link to="/orders" className="mt-4 inline-block text-red-500 font-medium">
          View your orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === 'delivered';

  return (
    <div className="max-w-lg mx-auto min-h-dvh flex flex-col">
      {/* Header */}
      <div className={`px-4 py-6 ${isDelivered ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        <div className="flex items-center gap-3 mb-4">
          <Link to="/orders" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold">Track Order</h1>
        </div>
        <p className="text-3xl font-bold">{order.id}</p>
        <p className="text-white/80 text-sm mt-1">{statuses.find((s) => s.status === order.status)?.label}</p>
        {!isDelivered && (
          <p className="text-white/90 text-sm mt-2 font-medium">
            Estimated delivery: {order.estimatedDelivery}
          </p>
        )}
        {isDelivered && (
          <p className="text-white/90 text-lg mt-2 font-bold">Enjoy your meal! 🎉</p>
        )}
      </div>

      {/* Status Timeline */}
      <div className="flex-1 bg-white">
        <div className="px-4 py-6">
          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
              <div
                className="h-full bg-red-500 rounded transition-all duration-1000"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {statuses.map((s, i) => {
                const isCompleted = statuses.findIndex((st) => st.status === order.status) >= i;
                return (
                  <div key={s.status} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all ${
                        isCompleted ? 'bg-red-500 scale-100' : 'bg-gray-200 scale-90'
                      }`}
                    >
                      {s.icon}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${isCompleted ? 'text-red-500' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img src={order.restaurantImage} alt={order.restaurantName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{order.restaurantName}</h3>
                <p className="text-xs text-gray-500">{order.items.length} items · ${order.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</h4>
              {order.items.map((ci) => (
                <div key={ci.menuItem.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {ci.quantity}× {ci.menuItem.name}
                  </span>
                  <span className="font-medium">${(ci.menuItem.price * ci.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Delivery Address
              </h4>
              <p className="text-sm text-gray-700">
                {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </p>
            </div>

            {/* Tracking Updates */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Updates</h4>
              <div className="space-y-2">
                {order.trackingUpdates
                  .slice()
                  .reverse()
                  .map((update, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-gray-400 flex-shrink-0">
                        {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-600">{update.message}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDelivered && (
        <div className="p-4">
          <Link
            to="/"
            className="block w-full text-center bg-red-500 text-white py-3.5 rounded-xl font-semibold text-sm"
          >
            Order Again
          </Link>
        </div>
      )}
    </div>
  );
}

function getMessage(status: OrderStatus): string {
  switch (status) {
    case 'confirmed': return 'Order confirmed';
    case 'preparing': return 'Restaurant is preparing your food';
    case 'picked_up': return 'Delivery partner has picked up your order';
    case 'delivering': return 'Your order is on the way';
    case 'delivered': return 'Order delivered successfully';
  }
}
