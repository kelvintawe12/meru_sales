import React, { useEffect, useState, useRef } from 'react';
import { UserIcon, MenuIcon, ClockIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NotificationBell } from '../ui/NotificationBell';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  onSignOut: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/refinery-form': 'Refinery Data Entry',
  '/fractionation-form': 'Fractionation Data Entry',
  '/chemicals': 'Chemicals',
  '/stocks': 'Stocks',
  '/mtd-summary': 'Month-to-Date Summary',
  '/reports': 'Reports',
  '/submissions': "Today's Submissions",
  '/help': 'Help & Support',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

export const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  sidebarOpen,
  onSignOut
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the title based on the current path
  const getPageTitle = () => {
    return pageTitles[location.pathname] || 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="md:hidden mr-4 hover:bg-gray-100 p-2 rounded-lg">
            <MenuIcon size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {getPageTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          {/* Real-time Clock */}
          <div className="hidden md:flex items-center space-x-2 text-gray-600">
            <ClockIcon size={18} />
            <span className="font-medium transition-all duration-300">
              {currentTime.toLocaleTimeString()}
            </span>
            <span className="text-sm text-gray-500">
              {currentTime.toLocaleDateString()}
            </span>
          </div>
          <NotificationBell />
          <div className="relative" ref={profileRef}>
            <div className="flex items-center">
              <div className="mr-2 text-right hidden md:block">
                <p className="text-sm font-medium text-gray-700"> Meru </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2C5B48] text-white"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <UserIcon size={18} />
              </button>
            </div>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <ul className="py-2">
                  <li>
                    <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Profile
                    </a>
                  </li>
                  <li>
                    <a href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={onSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
