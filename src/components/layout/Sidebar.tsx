import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon, FlaskConicalIcon, BeakerIcon, CalendarIcon,
  BarChart3Icon, ClipboardIcon, HelpCircleIcon, SettingsIcon,
  ChevronLeftIcon, ChevronRightIcon, ListIcon, TruckIcon,
  UserCircle2Icon
} from 'lucide-react';

export type SidebarSize = 'closed' | 'compact' | 'full';

export interface SidebarProps {
  size: SidebarSize;
  setSize: React.Dispatch<React.SetStateAction<SidebarSize>>;
  onSignOut: () => void;
}

export function Sidebar({ size, setSize }: SidebarProps) {
  const location = useLocation();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cycle through sidebar sizes
  const handleToggle = () => {
    setSize(prev =>
      prev === 'full' ? 'compact' :
      prev === 'compact' ? 'closed' : 'full'
    );
  };

  const menuItems = [
    // Overview Section
    {
      section: 'Overview',
      items: [{
        path: '/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboardIcon size={20} />
      }]
    },
    // Data Entry Section
    {
      section: 'Data Entry',
      items: [{
      path: '/vehicle-tracking',
      label: 'Vehicle Tracking',
      icon: <TruckIcon size={20} />
      }, {      path: '/production-form',
      label: 'Production Form',
      icon: <ClipboardIcon size={20} />
      }, {
      path: '/dispatch-analysis',
      label: 'Dispatch Analysis',
      icon: <BarChart3Icon size={20} />
      }, {
      path: '/pending-orders',
      label: 'Pending Orders',
      icon: <ListIcon size={20} />
      }, {
      path: '/sales-team',
      label: 'Sales Team',
      icon: <UserCircle2Icon size={20} />
      }, {
      path: '/calendar',
      label: 'Calendar',
      icon: <CalendarIcon size={20} />
      }]
    },
    // Dispatch Receipts Section
    {
      section: 'Dispatch Receipts',
      items: [{
        path: '/dispatch-receipt',
        label: 'New Receipt',
        icon: <ClipboardIcon size={20} />
      }, {
        path: '/dispatch',
        label: 'Daily Dispatch Reports',
        icon: <ClipboardIcon size={20} />
      }]
    },
    // System Section
    {
      section: 'System',
      items: [{
        path: '/help',
        label: 'Help',
        icon: <HelpCircleIcon size={20} />
      }, {
        path: '/settings',
        label: 'Settings',
        icon: <SettingsIcon size={20} />
      }]
    }
  ];

  // Sidebar width classes
  const widthClass =
    size === 'closed' ? 'w-0 md:w-12' :
    size === 'compact' ? 'w-20' :
    'w-64';

  // Hide content if closed
  const isClosed = size === 'closed';

  return (
    <aside
      className={`bg-[#1E3A8A] text-white transition-all duration-300 ease-in-out fixed top-0 left-0 h-screen z-50 ${widthClass} ${isClosed ? 'overflow-hidden' : ''}`}
      style={{ minWidth: isClosed ? 0 : undefined }}
    >
      <div className={`p-4 flex items-center justify-between ${isClosed ? 'hidden md:flex' : ''}`}>
        <div className="flex items-center">
          <img src="https://mountmerugroup.com/uploads/site-setting/frontend/logo.svg" alt="Meru Logo" className="h-15 w-20 rounded-md" />
          {size === 'full' && <h1 className="ml-3 font-bold text-lg">MERU REFINERY</h1>}
        </div>
        <button
          onClick={handleToggle}
          className="text-white hover:bg-[#3B82F6] rounded-full p-1 absolute -right-3 top-6 bg-[#1E3A8A] shadow-md border border-[#3B82F6]"
        >
          {size === 'full' ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>
      </div>
      {!isClosed && (
        <nav className="mt-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          <div className="space-y-6 px-2">
            {menuItems.map(section => (
              <div key={section.section}>
                {size === 'full' && (
                  <h3 className="px-3 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    {section.section}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map(item => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center w-full p-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-white text-[#2C5B48] font-medium'
                              : 'text-white hover:bg-[#3B82F6]'
                          }`
                        }
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {size === 'full' && <span className="ml-3">{item.label}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      )}
      {!isClosed && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className={`p-3 bg-[#3B82F6] rounded-lg ${size === 'full' ? 'flex items-center' : 'flex justify-center'}`}>
            <HelpCircleIcon size={20} />
            {size === 'full' && <span className="ml-3 text-sm">Need help?</span>}
          </div>
        </div>
      )}
      {!isClosed && !isOnline && (
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className="p-3 bg-red-600 text-white rounded-lg text-center font-semibold">
            You are currently offline. Some features may be unavailable.
          </div>
        </div>
      )}
    </aside>
  );
};