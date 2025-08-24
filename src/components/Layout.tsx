import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Eye, BarChart2, Settings, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Layout = () => {
  const location = useLocation();
  const { isModelLoaded, isMonitoring } = useAppContext();
  
  return (
    <div className="min-h-screen bg-[#faaa42] flex flex-col" style={{ minWidth: '800px' }}>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4">
            <img 
              src="./src/assets/focuslog.png"
              alt="FocuzStreak"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-black font-['Press_Start_2P']">FocuzStreak</span>
          </Link>
          
          <div className="flex items-center space-x-4 ml-8">
            {isModelLoaded ? (
              <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full font-['Press_Start_2P'] whitespace-nowrap">
                Model Ready
              </span>
            ) : (
              <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded-full animate-pulse font-['Press_Start_2P'] whitespace-nowrap">
                Loading Model...
              </span>
            )}
            
            {isMonitoring && (
              <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-['Press_Start_2P'] whitespace-nowrap">
                Monitoring Active
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-6">
        <Outlet />
      </main>
      
      <footer className="bg-white shadow-inner">
        <div className="container mx-auto px-6">
          <nav className="flex justify-between">
            <Link
              to="/"
              className={`py-4 px-8 flex flex-col items-center transition-colors font-['Press_Start_2P'] ${
                location.pathname === '/' 
                  ? 'text-[#faaa42] border-t-2 border-[#faaa42]' 
                  : 'text-gray-500 hover:text-[#faaa42]'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="text-[10px] mt-2">Monitor</span>
            </Link>
            <Link
              to="/dashboard"
              className={`py-4 px-8 flex flex-col items-center transition-colors font-['Press_Start_2P'] ${
                location.pathname === '/dashboard' 
                  ? 'text-[#faaa42] border-t-2 border-[#faaa42]' 
                  : 'text-gray-500 hover:text-[#faaa42]'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[10px] mt-2">Stats</span>
            </Link>
            <Link
              to="/shop"
              className={`py-4 px-8 flex flex-col items-center transition-colors font-['Press_Start_2P'] ${
                location.pathname === '/shop' 
                  ? 'text-[#faaa42] border-t-2 border-[#faaa42]' 
                  : 'text-gray-500 hover:text-[#faaa42]'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] mt-2">Shop</span>
            </Link>
            <Link
              to="/settings"
              className={`py-4 px-8 flex flex-col items-center transition-colors font-['Press_Start_2P'] ${
                location.pathname === '/settings' 
                  ? 'text-[#faaa42] border-t-2 border-[#faaa42]' 
                  : 'text-gray-500 hover:text-[#faaa42]'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] mt-2">Settings</span>
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Layout;