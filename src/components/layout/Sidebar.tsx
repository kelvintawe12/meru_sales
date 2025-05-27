import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon, FlaskConicalIcon, BeakerIcon, CalendarIcon,
  BarChart3Icon, ClipboardIcon, HelpCircleIcon, SettingsIcon,
  ChevronLeftIcon, ChevronRightIcon, ListIcon
} from 'lucide-react';

export type SidebarSize = 'closed' | 'compact' | 'full';

export interface SidebarProps {
  size: SidebarSize;
  setSize: React.Dispatch<React.SetStateAction<SidebarSize>>;
  onSignOut: () => void; // <-- Add this line
}

export function Sidebar({ size, setSize }: SidebarProps) {
  const location = useLocation();

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
        path: '/refinery-form',
        label: 'Refinery Form',
        icon: <FlaskConicalIcon size={20} />
      }, {
        path: '/stocks',
        label: 'Stocks Form',
        icon: <ClipboardIcon size={20} />
      }, {
        path: '/fractionation-form',
        label: 'Fractionation Form',
        icon: <BeakerIcon size={20} />
      }, {
        path: '/chemicals',
        label: 'Chemicals Form',
        icon: <FlaskConicalIcon size={20} />
      }]
    },
    // Reports Section
    {
      section: 'Reports & Analysis',
      items: [{
        path: '/mtd-summary',
        label: 'MTD Summary',
        icon: <CalendarIcon size={20} />
      }, {
        path: '/reports',
        label: 'Reports',
        icon: <BarChart3Icon size={20} />
      }, {
        path: '/submissions',
        label: "Today's Submissions",
        icon: <ListIcon size={20} />
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
      className={`bg-[#2C5B48] text-white transition-all duration-300 ease-in-out fixed top-0 left-0 h-screen z-50 ${widthClass} ${isClosed ? 'overflow-hidden' : ''}`}
      style={{ minWidth: isClosed ? 0 : undefined }}
    >
      <div className={`p-4 flex items-center justify-between ${isClosed ? 'hidden md:flex' : ''}`}>
        <div className="flex items-center">
          <img src="https://placehold.co/40x40/2C5B48/FFFFFF/png?text=M" alt="Meru Logo" className="h-10 w-10 rounded-md" />
          {size === 'full' && <h1 className="ml-3 font-bold text-lg">MERU REFINERY</h1>}
        </div>
        <button
          onClick={handleToggle}
          className="text-white hover:bg-[#224539] rounded-full p-1 absolute -right-3 top-6 bg-[#2C5B48] shadow-md border border-[#224539]"
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
                              : 'text-white hover:bg-[#224539]'
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
          <div className={`p-3 bg-[#224539] rounded-lg ${size === 'full' ? 'flex items-center' : 'flex justify-center'}`}>
            <HelpCircleIcon size={20} />
            {size === 'full' && <span className="ml-3 text-sm">Need help?</span>}
          </div>
        </div>
      )}
    </aside>
  );
};
