# QuickBite PWA - Architecture Plan

## Stack
- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **Styling:** Tailwind CSS 3
- **Routing:** React Router v6
- **State:** React Context + useReducer for cart, localStorage persistence
- **PWA:** vite-plugin-pwa (service worker + manifest)
- **Icons:** SVG inline / Lucide React

## Route Structure
| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Featured restaurants, categories, search |
| `/search?q=` | SearchPage | Search results with filters |
| `/restaurant/:id` | RestaurantPage | Restaurant detail with menu |
| `/cart` | CartPage | Cart review and management |
| `/checkout` | CheckoutPage | Address, payment, order placement |
| `/order/:id` | OrderTrackingPage | Real-time order status tracking |
| `/orders` | OrderHistoryPage | Past orders list |
| `/profile` | ProfilePage | User profile, saved addresses |

## Component Tree
```
App
├── Layout
│   ├── Header (logo, search icon, cart icon with badge)
│   ├── BottomNav (Home, Search, Orders, Profile)
│   └── <Outlet />
├── HomePage
│   ├── HeroBanner
│   ├── CategoryChips
│   ├── FeaturedRestaurants -> RestaurantCard[]
│   └── PopularDishes -> DishCard[]
├── RestaurantPage
│   ├── RestaurantHeader (image, info, rating)
│   ├── CategoryTabs
│   └── MenuSection -> MenuItemCard[]
├── SearchPage
│   ├── SearchInput
│   ├── FilterBar
│   └── SearchResults (restaurants + dishes)
├── CartPage / CartDrawer
│   ├── CartItem[]
│   ├── CartSummary
│   └── CheckoutButton
├── CheckoutPage
│   ├── AddressForm / SavedAddresses
│   ├── PaymentMethodSelector
│   ├── OrderSummary
│   └── PlaceOrderButton
├── OrderTrackingPage
│   ├── StatusTimeline
│   ├── OrderDetails
│   ├── DeliveryEstimate
│   └── RestaurantInfo
├── OrderHistoryPage
│   └── OrderCard[] -> expandable
└── ProfilePage
    ├── ProfileForm
    ├── SavedAddresses list
    └── AppSettings
```

## Data Flow
- **Demo Data:** Static JSON files for restaurants, menu items
- **Cart State:** React Context + useReducer, persisted to localStorage
- **Orders:** Created at checkout, stored in localStorage, tracking simulated with setInterval
- **Profile:** localStorage for user info, saved addresses

## PWA Configuration
- manifest.json with icons, name, theme-color
- Service worker with caching strategies
- Install prompt handling
