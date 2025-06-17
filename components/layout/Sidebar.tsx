
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { NAV_ITEMS, APP_NAME, LogoutIcon, XIcon } from '../../constants';
import type { NavItem } from '../../constants';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const NavItemLink: React.FC<{ item: NavItem; onClick?: () => void }> = ({ item, onClick }) => (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out
         ${isActive 
           ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-900 shadow-lg' 
           : 'text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-700 hover:text-sky-700 dark:hover:text-sky-300'
         }`
      }
    >
      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
                   transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                   lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
          <Link to="/" className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            {APP_NAME}
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.name} item={item} onClick={() => setIsOpen(false)} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => { console.log("Logout clicked"); setIsOpen(false); /* Implement logout logic */ }}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-700/50 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-150 ease-in-out"
          >
            <LogoutIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
