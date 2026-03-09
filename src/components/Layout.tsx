import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Eye, BarChart2, Settings, ShoppingBag, ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import focusLogImg from '../assets/focuslog.png';

const Layout = () => {
  const location = useLocation();
  const { isModelLoaded, isMonitoring } = useAppContext();
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime?.id;
  const openFullPage = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime?.id) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    }
  };
  return (
    <div className="min-h-screen bg-[#faaa42] flex flex-col">
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className={`mx-auto px-6 py-4 flex items-center justify-between ${isExtension ? 'max-w-full' : 'container'}`}>
          <Link to="/" className="flex items-center space-x-4 min-w-0">
            <img 
              src={focusLogImg}
              alt="FocuzStreak"
              className="w-10 h-10 flex-shrink-0"
            />
            <span className="text-xl font-bold text-black font-['Press_Start_2P'] truncate">FocuzStreak</span>
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
            {isExtension && (
              <button
                type="button"
                onClick={openFullPage}
                className="flex items-center gap-1 text-xs px-2 py-1.5 bg-[#faaa42] text-black rounded hover:bg-[#e99932] font-['Press_Start_2P'] whitespace-nowrap"
                title="Open in full page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Full page
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow min-h-0 overflow-y-auto overflow-x-hidden container mx-auto px-6 py-6">
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