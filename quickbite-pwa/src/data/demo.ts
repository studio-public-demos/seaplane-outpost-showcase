import type { Restaurant, MenuItem } from '../types';

export const restaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Royal Biryani House',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',
    rating: 4.5,
    ratingCount: 1200,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    categories: ['Indian', 'Biryani', 'Curry'],
    isOpen: true,
    address: '123 Spice Lane, Mumbai',
    description: 'Authentic Hyderabadi biryani and royal Indian cuisine crafted with centuries-old recipes.',
  },
  {
    id: 'r2',
    name: 'Pizza Paradise',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop',
    rating: 4.3,
    ratingCount: 890,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    categories: ['Italian', 'Pizza', 'Pasta'],
    isOpen: true,
    address: '456 Dough Street, Mumbai',
    description: 'Wood-fired pizzas with the freshest ingredients and handcrafted pasta since 2010.',
  },
  {
    id: 'r3',
    name: 'Sushi Zen',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop',
    rating: 4.7,
    ratingCount: 650,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    categories: ['Japanese', 'Sushi', 'Asian'],
    isOpen: true,
    address: '789 Sakura Road, Mumbai',
    description: 'Premium Japanese dining experience with fresh sushi, sashimi, and robata grill specialties.',
  },
  {
    id: 'r4',
    name: 'Burger Barn',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
    rating: 4.1,
    ratingCount: 2100,
    deliveryTime: '15-25 min',
    deliveryFee: 0.99,
    categories: ['American', 'Burgers', 'Fast Food'],
    isOpen: true,
    address: '321 Grill Avenue, Mumbai',
    description: 'Juicy, handcrafted burgers made from 100% Angus beef with crispy fries and thick shakes.',
  },
  {
    id: 'r5',
    name: 'Dragon Wok',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop',
    rating: 4.4,
    ratingCount: 780,
    deliveryTime: '25-35 min',
    deliveryFee: 2.49,
    categories: ['Chinese', 'Noodles', 'Asian'],
    isOpen: true,
    address: '654 Wok Street, Mumbai',
    description: 'Sizzling wok-tossed noodles, dim sums, and Sichuan specialties for bold flavor lovers.',
  },
  {
    id: 'r6',
    name: 'Taco Fiesta',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop',
    rating: 4.6,
    ratingCount: 540,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    categories: ['Mexican', 'Tacos', 'Burritos'],
    isOpen: false,
    address: '987 Salsa Blvd, Mumbai',
    description: 'Vibrant Mexican street food with hand-pressed tortillas, fresh guacamole, and zesty salsas.',
  },
];

export const menuItems: MenuItem[] = [
  // Royal Biryani House
  { id: 'm1', restaurantId: 'r1', name: 'Hyderabadi Chicken Biryani', description: 'Fragrant basmati rice layered with spiced chicken, slow-cooked with saffron and caramelized onions', price: 12.99, image: 'https://images.unsplash.com/photo-1630851840633-f96992847032?w=400&h=300&fit=crop', category: 'Biryani', isPopular: true, isVegetarian: false, spiceLevel: 'hot' },
  { id: 'm2', restaurantId: 'r1', name: 'Veg Dum Biryani', description: 'Aromatic rice cooked with fresh vegetables, mint, and royal spices under a dough seal', price: 10.99, image: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=400&h=300&fit=crop', category: 'Biryani', isPopular: false, isVegetarian: true, spiceLevel: 'medium' },
  { id: 'm3', restaurantId: 'r1', name: 'Butter Chicken', description: 'Tender tandoori chicken in a creamy tomato-based gravy with fenugreek and butter', price: 11.99, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop', category: 'Curry', isPopular: true, isVegetarian: false, spiceLevel: 'mild' },
  { id: 'm4', restaurantId: 'r1', name: 'Palak Paneer', description: 'Fresh cottage cheese cubes in a vibrant spinach puree with ginger and garlic', price: 9.99, image: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400&h=300&fit=crop', category: 'Curry', isPopular: false, isVegetarian: true, spiceLevel: 'mild' },
  { id: 'm5', restaurantId: 'r1', name: 'Garlic Naan', description: 'Soft leavened bread brushed with garlic butter and baked in a tandoor', price: 3.49, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', category: 'Breads', isPopular: true, isVegetarian: true, spiceLevel: 'mild' },

  // Pizza Paradise
  { id: 'm6', restaurantId: 'r2', name: 'Margherita Pizza', description: 'San Marzano tomato sauce, fresh mozzarella, basil on thin Neapolitan crust', price: 10.99, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', category: 'Pizza', isPopular: true, isVegetarian: true, spiceLevel: 'mild' },
  { id: 'm7', restaurantId: 'r2', name: 'Pepperoni Supreme', description: 'Loaded with premium pepperoni, mozzarella, and our signature tomato sauce', price: 13.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', category: 'Pizza', isPopular: true, isVegetarian: false, spiceLevel: 'medium' },
  { id: 'm8', restaurantId: 'r2', name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce base with grilled chicken, red onions, and cilantro', price: 14.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'Pizza', isPopular: false, isVegetarian: false, spiceLevel: 'medium' },
  { id: 'm9', restaurantId: 'r2', name: 'Creamy Alfredo Pasta', description: 'Fettuccine in a rich parmesan cream sauce with garlic bread on the side', price: 11.99, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', category: 'Pasta', isPopular: false, isVegetarian: true, spiceLevel: 'mild' },

  // Sushi Zen
  { id: 'm10', restaurantId: 'r3', name: 'Salmon Avocado Roll', description: 'Fresh Atlantic salmon with creamy avocado wrapped in seasoned sushi rice', price: 14.99, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', category: 'Rolls', isPopular: true, isVegetarian: false, spiceLevel: 'mild' },
  { id: 'm11', restaurantId: 'r3', name: 'California Roll', description: 'Crab stick, cucumber, and avocado with tobiko on the outside', price: 12.99, image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400&h=300&fit=crop', category: 'Rolls', isPopular: false, isVegetarian: false, spiceLevel: 'mild' },
  { id: 'm12', restaurantId: 'r3', name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy mayo and scallions for a bold kick', price: 15.99, image: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&h=300&fit=crop', category: 'Rolls', isPopular: true, isVegetarian: false, spiceLevel: 'hot' },
  { id: 'm13', restaurantId: 'r3', name: 'Chicken Teriyaki Bowl', description: 'Grilled chicken glazed in house teriyaki sauce over steamed rice with vegetables', price: 13.99, image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop', category: 'Bowls', isPopular: false, isVegetarian: false, spiceLevel: 'mild' },

  // Burger Barn
  { id: 'm14', restaurantId: 'r4', name: 'Classic Cheeseburger', description: 'Angus beef patty with cheddar, lettuce, tomato, pickles, and barn sauce', price: 8.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', category: 'Burgers', isPopular: true, isVegetarian: false, spiceLevel: 'mild' },
  { id: 'm15', restaurantId: 'r4', name: 'Bacon Double Stack', description: 'Two beef patties, double bacon, American cheese, and smoky BBQ sauce', price: 12.99, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop', category: 'Burgers', isPopular: true, isVegetarian: false, spiceLevel: 'medium' },
  { id: 'm16', restaurantId: 'r4', name: 'Crispy Chicken Sandwich', description: 'Crispy fried chicken breast with coleslaw and spicy sriracha mayo', price: 9.99, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop', category: 'Burgers', isPopular: false, isVegetarian: false, spiceLevel: 'hot' },
  { id: 'm17', restaurantId: 'r4', name: 'Loaded Cheese Fries', description: 'Crispy fries topped with melted cheese, bacon bits, and green onions', price: 6.49, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&h=300&fit=crop', category: 'Sides', isPopular: true, isVegetarian: false, spiceLevel: 'mild' },

  // Dragon Wok
  { id: 'm18', restaurantId: 'r5', name: 'Kung Pao Chicken', description: 'Wok-tossed chicken with peanuts, dried chilies, and vegetables in a tangy sauce', price: 11.99, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop', category: 'Mains', isPopular: true, isVegetarian: false, spiceLevel: 'hot' },
  { id: 'm19', restaurantId: 'r5', name: 'Vegetable Hakka Noodles', description: 'Stir-fried noodles with crunchy vegetables, soy sauce, and chili garlic', price: 9.99, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', category: 'Noodles', isPopular: false, isVegetarian: true, spiceLevel: 'medium' },
  { id: 'm20', restaurantId: 'r5', name: 'Chicken Manchurian', description: 'Crispy chicken balls tossed in a spicy, tangy Manchurian gravy', price: 12.99, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop', category: 'Mains', isPopular: true, isVegetarian: false, spiceLevel: 'hot' },
  { id: 'm21', restaurantId: 'r5', name: 'Spring Rolls (4 pcs)', description: 'Crispy golden rolls stuffed with seasoned vegetables, served with sweet chili dip', price: 5.99, image: 'https://images.unsplash.com/photo-1606525437818-91114898df6a?w=400&h=300&fit=crop', category: 'Starters', isPopular: false, isVegetarian: true, spiceLevel: 'mild' },

  // Taco Fiesta
  { id: 'm22', restaurantId: 'r6', name: 'Street Tacos (3 pcs)', description: 'Three soft corn tortillas with your choice of carne asada, carnitas, or pollo', price: 9.99, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', category: 'Tacos', isPopular: true, isVegetarian: false, spiceLevel: 'medium' },
  { id: 'm23', restaurantId: 'r6', name: 'Burrito Bowl', description: 'Cilantro lime rice, black beans, grilled veggies, guacamole, and chipotle crema', price: 11.99, image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=300&fit=crop', category: 'Bowls', isPopular: false, isVegetarian: true, spiceLevel: 'mild' },
  { id: 'm24', restaurantId: 'r6', name: 'Quesadilla Grande', description: 'Large flour tortilla with melted cheese, peppers, and chipotle chicken', price: 10.99, image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop', category: 'Quesadillas', isPopular: true, isVegetarian: false, spiceLevel: 'medium' },
  { id: 'm25', restaurantId: 'r6', name: 'Chips & Guac', description: 'Crunchy tortilla chips with fresh house-made guacamole and pico de gallo', price: 6.99, image: 'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=300&fit=crop', category: 'Starters', isPopular: false, isVegetarian: true, spiceLevel: 'mild' },
];

export const categories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'Indian', name: 'Indian', icon: '🍛' },
  { id: 'Italian', name: 'Italian', icon: '🍕' },
  { id: 'Japanese', name: 'Japanese', icon: '🍣' },
  { id: 'American', name: 'American', icon: '🍔' },
  { id: 'Chinese', name: 'Chinese', icon: '🥡' },
  { id: 'Mexican', name: 'Mexican', icon: '🌮' },
  { id: 'Fast Food', name: 'Fast Food', icon: '🍟' },
  { id: 'Biryani', name: 'Biryani', icon: '🥘' },
];

export const defaultAddresses = [
  {
    id: 'a1',
    label: 'Home',
    street: '42 Park Avenue, Apartment 3B',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    isDefault: true,
  },
  {
    id: 'a2',
    label: 'Work',
    street: '15 Tech Park, 7th Floor',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400076',
    isDefault: false,
  },
];
