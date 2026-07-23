import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Order, CartItem } from '../types';
import { useCart } from '../context/CartContext';

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  picked_up: 'bg-purple-100 text-purple-700',
  delivering: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const stored: Order[] = JSON.parse(localStorage.getItem('quickbite_orders') || '[]');
    const parsed = stored.map((o) => ({ ...o, createdAt: new Date(o.createdAt) }));
    setOrders(parsed);
  }, []);

  const handleReorder = (order: Order) => {
    order.items.forEach((item: CartItem) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem(item.menuItem, item.restaurantId, item.restaurantName);
      }
    });
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-4">
        <p className="text-5xl mb-4">📋</p>
        <h2 className="text-lg font-bold text-gray-700">No orders yet</h2>
        <p className="text-gray-400 text-sm mt-1">Place your first order and it will appear here</p>
        <Link
          to="/"
          className="inline-block mt-5 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
        >
          Start Ordering
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-6">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold">My Orders</h1>
        <p className="text-sm text-gray-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onReorder={() => handleReorder(order)}
            onTrack={() => navigate(`/order/${order.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onReorder,
  onTrack,
}: {
  order: Order;
  onReorder: () => void;
  onTrack: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDelivered = order.status === 'delivered';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <img src={order.restaurantImage} alt={order.restaurantName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{order.restaurantName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {order.id} · {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fade-in">
            {order.items.map((ci) => (
              <div key={ci.menuItem.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {ci.quantity}× {ci.menuItem.name}
                </span>
                <span className="font-medium">${(ci.menuItem.price * ci.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-sm">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400">
              Delivered to: {order.deliveryAddress.street}
            </p>
          </div>
        )}

        <div className={`flex items-center gap-0.5 mt-2 text-xs ${expanded ? 'text-gray-400' : 'text-gray-300'}`}>
          {expanded ? 'Show less' : 'Tap for details'}
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className="flex border-t border-gray-100">
        {!isDelivered && (
          <button
            onClick={(e) => { e.stopPropagation(); onTrack(); }}
            className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Track Order
          </button>
        )}
        {isDelivered && (
          <button
            onClick={(e) => { e.stopPropagation(); onReorder(); }}
            className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Reorder
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
