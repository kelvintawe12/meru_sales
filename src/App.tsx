import React from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import  Dashboard  from './pages/Dashboard';
import  VehicleTrackingForm from './pages/Vehicletracking';
import  FractionationForm  from './pages/FractionationForm';
import  MTDSummary  from './pages/MTDSummary';
import Help from './pages/Help';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import  PendingOrders  from './pages/PendingOrders';
import { Stocks } from './pages/Stocks';
import  Reports  from './pages/Reports';
import  Submissions  from './pages/Submissions';
import Status from './pages/Status';
import { ToasterProvider } from './components/ui/Toaster';
import { MeruLoader } from './components/ui/MeruLoader';
import Offline from './pages/Offline';
const Dispatch = React.lazy(() => import('./pages/Dispatch'));
const DispatchReceipt = React.lazy(() => import('./pages/DispatchReceipt'));

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/vehicle-tracking': 'vehicle Tracking',
  '/fractionation-form': 'deports ',
  '/pending-orders': 'Orders',
  '/stocks': 'Stocks',
  '/mtd-summary': 'MTD Summary',
  '/reports': 'Reports',
  '/submissions': 'Submissions',
  '/help': 'Help',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/dispatch-receipt': 'Dispatch Receipt',
};

function usePageTitle(location: ReturnType<typeof useLocation>) {
  useEffect(() => {
    document.title = pageTitles[location.pathname] || 'Meru Refinery';
  }, [location.pathname]);
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center mb-6">
        <span className="text-6xl font-extrabold text-blue-600 mr-4">404</span>
        <svg
          className="w-12 h-12 text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold mb-2 text-gray-800">Page Not Found</h1>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/dashboard"
        className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </a>
    </div>
  );
}

type SidebarSize = 'closed' | 'compact' | 'full';

export function App() {
  const location = useLocation();
  usePageTitle(location);

  // Show loader only on first load or sign out
  const [showLoader, setShowLoader] = useState(true);

  // Only show loader on first mount
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  // Handler for sign out (call this from your sign out button)
  const handleSignOut = () => {
    setShowLoader(true);
    setTimeout(() => {
      // ...your sign out logic (clear auth, redirect, etc)...
      window.location.href = "/"; // or use navigate("/")
    }, 1200); // Show loader for 1.2s before redirect
  };

  // Sidebar state: 'closed', 'compact', 'full'
  const [sidebarSize, setSidebarSize] = useState<SidebarSize>('full');

  // Adjust margin based on sidebar size
  const marginLeft =
    sidebarSize === 'closed' ? 'ml-0' :
    sidebarSize === 'compact' ? 'ml-20' :
    'ml-64';

  // Network status state
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

  return (
    <ToasterProvider>
      {showLoader && <MeruLoader />}
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          size={sidebarSize}
          setSize={setSidebarSize}
          onSignOut={handleSignOut} // Pass handler to Sidebar if sign out is there
        />
        <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out ${marginLeft}`}>
          <Header
            sidebarOpen={sidebarSize !== 'closed'}
            toggleSidebar={() => setSidebarSize(
              sidebarSize === 'full' ? 'compact' :
              sidebarSize === 'compact' ? 'closed' : 'full'
            )}
            onSignOut={handleSignOut} // Or pass to Header if sign out is there
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Routes>
              {!isOnline && <Route path="*" element={<Offline />} />}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vehicle-tracking" element={<VehicleTrackingForm />} />
              <Route path="/fractionation-form" element={<FractionationForm />} />
              <Route path="/pending-orders" element={<PendingOrders />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/mtd-summary" element={<MTDSummary />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/submissions" element={<Submissions />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/status" element={<React.Suspense fallback={<div>Loading...</div>}><Status /></React.Suspense>} />
              <Route
              path="/dispatch"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                <Dispatch />
                </React.Suspense>
              }
              />
              <Route path="*" element={<NotFound />} />
              <Route
                path="/dispatch-receipt"
                element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <DispatchReceipt />
                  </React.Suspense>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </ToasterProvider>
  );
}
