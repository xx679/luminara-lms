
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS, MenuIcon, ChevronDownIcon, StarIcon } from '../../constants'; // Assuming StarIcon is available

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const activeItem = NAV_ITEMS.find(item => currentPath.startsWith(item.path));
    if (currentPath.includes("/courses/") && currentPath !== "/courses") {
        return "Course Details";
    }
    return activeItem ? activeItem.name : 'Dashboard';
  };
  
  const user = { // Mock user
    name: 'Alex Johnson',
    avatarUrl: 'https://picsum.photos/seed/user1/100/100',
    email: 'alex.johnson@example.com'
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mr-3"
          aria-label="Open sidebar"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{getCurrentPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Mock Search Bar */}
        <div className="hidden md:block">
          <input 
            type="search" 
            placeholder="Search anything..." 
            className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          />
        </div>

        {/* Mock Notifications Icon */}
        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600" />
            <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
            <ChevronDownIcon className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileOpen && (
            <div 
              onMouseLeave={() => setProfileOpen(false)}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl ring-1 ring-black ring-opacity-5 py-1 z-50">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700"></div>
              <a href="#/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Your Profile</a>
              <a href="#/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Settings</a>
              <div className="border-t border-slate-200 dark:border-slate-700"></div>
              <button 
                onClick={() => { console.log("Logout from profile"); setProfileOpen(false); /* Implement logout */ }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
