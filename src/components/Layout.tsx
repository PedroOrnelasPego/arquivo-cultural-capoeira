import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light text-slate-900 antialiased overflow-x-hidden">
      {!isLogin && <Navbar />}
      <div className={`flex-1 flex flex-col ${!isLogin ? 'mt-[72px]' : ''}`}>
        <Outlet />
      </div>
      {!isLogin && <Footer />}
    </div>
  );
}
