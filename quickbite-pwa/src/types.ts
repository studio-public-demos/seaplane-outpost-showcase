export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  deliveryFee: number;
  categories: string[];
  isOpen: boolean;
  address: string;
  description: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular: boolean;
  isVegetarian: boolean;
  spiceLevel: 'mild' | 'medium' | 'hot';
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'picked_up' | 'delivering' | 'delivered';

export interface TrackingUpdate {
  status: OrderStatus;
  timestamp: Date;
  message: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  deliveryAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  estimatedDelivery: string;
  trackingUpdates: TrackingUpdate[];
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  savedAddresses: Address[];
}
