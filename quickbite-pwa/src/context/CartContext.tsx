import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; menuItem: MenuItem; restaurantId: string; restaurantName: string }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.menuItem.id === action.menuItem.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.menuItem.id === action.menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            menuItem: action.menuItem,
            quantity: 1,
            restaurantId: action.restaurantId,
            restaurantName: action.restaurantName,
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.menuItem.id !== action.itemId) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.menuItem.id !== action.itemId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItem.id === action.itemId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

const initialState: CartState = { items: [] };

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  restaurantId: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('quickbite_cart');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        dispatch({ type: 'LOAD_CART', items });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quickbite_cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (menuItem: MenuItem, restaurantId: string, restaurantName: string) => {
    dispatch({ type: 'ADD_ITEM', menuItem, restaurantId, restaurantName });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', itemId });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total = state.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
  const restaurantId = state.items.length > 0 ? state.items[0].restaurantId : null;

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart, itemCount, total, restaurantId }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
