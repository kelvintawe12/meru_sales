import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import  Dashboard  from './pages/Dashboard';
import { RefineryForm } from './pages/RefineryForm';
import { FractionationForm } from './pages/FractionationForm';
import { MTDSummary } from './pages/MTDSummary';
import { Help } from './pages/Help';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Chemicals } from './pages/Chemicals';
import { Stocks } from './pages/Stocks';
import  Reports  from './pages/Reports';
import { Submissions } from './pages/Submissions';
import { ToasterProvider } from './components/ui/Toaster';
import { MeruLoader } from './components/ui/MeruLoader';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/refinery-form': 'Refinery Data Entry',
  '/fractionation-form': 'Fractionation Data Entry',
  '/chemicals': 'Chemicals',
  '/stocks': 'Stocks',
  '/mtd-summary': 'MTD Summary',
  '/reports': 'Reports',
  '/submissions': 'Submissions',
  '/help': 'Help',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

function usePageTitle() {
  const location = useLocation();
  useEffect(() => {
    document.title = pageTitles[location.pathname] || 'Meru Refinery';
  }, [location.pathname]);
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-4">Page Not Found</p>
      <a href="/" className="text-blue-600 underline">Go to Dashboard</a>
    </div>
  );
}

type SidebarSize = 'closed' | 'compact' | 'full';

export function App() {
  usePageTitle();
  const location = useLocation();

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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/refinery-form" element={<RefineryForm />} />
              <Route path="/fractionation-form" element={<FractionationForm />} />
              <Route path="/chemicals" element={<Chemicals />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/mtd-summary" element={<MTDSummary />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/submissions" element={<Submissions />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToasterProvider>
  );
}