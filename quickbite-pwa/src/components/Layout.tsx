import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const isOrderTracking = location.pathname.startsWith('/order/');

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {!isOrderTracking && <Header />}
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      {!isOrderTracking && <BottomNav />}
    </div>
  );
}
