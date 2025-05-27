import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SaveIcon, UserIcon, KeyIcon, DatabaseIcon, BellIcon } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadFromStorage<T>(key: string, fallback: T): T {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : fallback;
}

export const Settings: React.FC = () => {
  const { notifications, loading: notificationsLoading, addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('account');
  const [editAccount, setEditAccount] = useState(false);

  // Account state
  const [account, setAccount] = useState(() =>
    loadFromStorage('settings_account', {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Administrator'
    })
  );

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // API state
  const [api, setApi] = useState(() =>
    loadFromStorage('settings_api', {
      apiKey: 'AIza...Xu8',
      sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      deploymentId: 'AKfycbzF...'
    })
  );

  // Notification toggles
  const [emailNotif, setEmailNotif] = useState(() =>
    loadFromStorage('settings_emailNotif', true)
  );
  const [formNotif, setFormNotif] = useState(() =>
    loadFromStorage('settings_formNotif', true)
  );
  const [monthlyNotif, setMonthlyNotif] = useState(() =>
    loadFromStorage('settings_monthlyNotif', false)
  );

  // Handlers
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccount(prev => {
      const updated = { ...prev, [name]: value };
      saveToStorage('settings_account', updated);
      return updated;
    });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurity(prev => ({ ...prev, [name]: value }));
  };

  const handleApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApi(prev => {
      const updated = { ...prev, [name]: value };
      saveToStorage('settings_api', updated);
      return updated;
    });
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    saveToStorage('settings_account', account);
    addNotification('Account details updated successfully!', 'success');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      addNotification('Please fill in all password fields.', 'warning');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      addNotification('New passwords do not match.', 'error');
      return;
    }
    addNotification('Password updated successfully!', 'success');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveApi = (e: React.FormEvent) => {
    e.preventDefault();
    saveToStorage('settings_api', api);
    addNotification('API settings saved!', 'success');
  };

  const handleToggle = (type: 'email' | 'form' | 'monthly') => {
    if (type === 'email') {
      setEmailNotif(v => {
        saveToStorage('settings_emailNotif', !v);
        addNotification(`Email notifications ${!v ? 'enabled' : 'disabled'}.`, 'info');
        return !v;
      });
    } else if (type === 'form') {
      setFormNotif(v => {
        saveToStorage('settings_formNotif', !v);
        addNotification(`Form submission alerts ${!v ? 'enabled' : 'disabled'}.`, 'info');
        return !v;
      });
    } else if (type === 'monthly') {
      setMonthlyNotif(v => {
        saveToStorage('settings_monthlyNotif', !v);
        addNotification(`Monthly reports ${!v ? 'enabled' : 'disabled'}.`, 'info');
        return !v;
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <form className="space-y-4" onSubmit={handleSaveAccount}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={account.name}
                onChange={handleAccountChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="Enter your full name"
                required
                readOnly={!editAccount}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={account.email}
                onChange={handleAccountChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="your@email.com"
                required
                readOnly={!editAccount}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={account.role}
                onChange={handleAccountChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                disabled={!editAccount}
              >
                <option>Administrator</option>
                <option>Operator</option>
                <option>Viewer</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant={editAccount ? "outline" : "primary"}
                className={`mr-2 ${editAccount ? "bg-gray-100 text-blue-700 border-blue-300" : "bg-[#2C5B48] text-white"}`}
                onClick={() => setEditAccount(e => !e)}
              >
                {editAccount ? "Lock" : "Edit"}
              </Button>
              <Button
                icon={<SaveIcon size={18} />}
                className="w-full md:w-auto"
                type="submit"
                disabled={!editAccount}
              >
                Save Changes
              </Button>
            </div>
            {!editAccount && (
              <div className="text-xs text-gray-500 mt-2">
                Fields are locked. Click "Edit" to make changes.
              </div>
            )}
          </form>
        );
      case 'security':
        return (
          <form className="space-y-4" onSubmit={handleUpdatePassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={security.currentPassword}
                onChange={handleSecurityChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={security.newPassword}
                onChange={handleSecurityChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={security.confirmPassword}
                onChange={handleSecurityChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                required
              />
            </div>
            <div className="pt-2">
              <Button icon={<SaveIcon size={18} />} className="w-full md:w-auto">Update Password</Button>
            </div>
          </form>
        );
      case 'api':
        return (
          <form className="space-y-4" onSubmit={handleSaveApi}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Sheets API Key</label>
              <input
                type="text"
                name="apiKey"
                value={api.apiKey}
                onChange={handleApiChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Sheets ID</label>
              <input
                type="text"
                name="sheetId"
                value={api.sheetId}
                onChange={handleApiChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AppScript Deployment ID</label>
              <input
                type="text"
                name="deploymentId"
                value={api.deploymentId}
                onChange={handleApiChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                required
              />
            </div>
            <div className="pt-2">
              <Button icon={<SaveIcon size={18} />} className="w-full md:w-auto">Save API Settings</Button>
            </div>
          </form>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">
                  Receive email notifications for important events
                </p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  id="toggle-1"
                  className="sr-only"
                  checked={emailNotif}
                  onChange={() => handleToggle('email')}
                />
                <label
                  htmlFor="toggle-1"
                  className={`block h-6 w-12 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    emailNotif ? 'bg-[#2C5B48]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full transition-all duration-200 ease-in-out ${
                      emailNotif ? 'translate-x-6' : ''
                    }`}
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium">Form Submission Alerts</h3>
                <p className="text-sm text-gray-500">
                  Get notified when new data is submitted
                </p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  id="toggle-2"
                  className="sr-only"
                  checked={formNotif}
                  onChange={() => handleToggle('form')}
                />
                <label
                  htmlFor="toggle-2"
                  className={`block h-6 w-12 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    formNotif ? 'bg-[#2C5B48]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full transition-all duration-200 ease-in-out ${
                      formNotif ? 'translate-x-6' : ''
                    }`}
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium">Monthly Report</h3>
                <p className="text-sm text-gray-500">
                  Receive monthly summary reports
                </p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  id="toggle-3"
                  className="sr-only"
                  checked={monthlyNotif}
                  onChange={() => handleToggle('monthly')}
                />
                <label
                  htmlFor="toggle-3"
                  className={`block h-6 w-12 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    monthlyNotif ? 'bg-[#2C5B48]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full transition-all duration-200 ease-in-out ${
                      monthlyNotif ? 'translate-x-6' : ''
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 px-2 md:px-0 max-w-3xl mx-auto w-full">
      {/* Notifications Section */}
      <Card title="System Notifications" className="w-full">
        {notificationsLoading ? (
          <div>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications at this time.</div>
        ) : (
          <ul>
            {notifications.map(n => (
              <li key={n.id} className="mb-1">
                <strong className={`mr-2 ${n.type === 'error' ? 'text-red-600' : n.type === 'success' ? 'text-green-600' : n.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {n.type.toUpperCase()}:
                </strong>
                {n.message} {n.read ? <span className="text-xs text-gray-400">(Read)</span> : <span className="text-xs text-blue-400">(Unread)</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Settings" className="w-full">
        <div className="flex flex-wrap border-b border-gray-200 overflow-x-auto">
          <button className={`flex-1 min-w-[120px] px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'account' ? 'border-[#2C5B48] text-[#2C5B48]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('account')}>
            <div className="flex items-center justify-center">
              <UserIcon size={16} className="mr-2" />
              Account
            </div>
          </button>
          <button className={`flex-1 min-w-[120px] px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'security' ? 'border-[#2C5B48] text-[#2C5B48]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('security')}>
            <div className="flex items-center justify-center">
              <KeyIcon size={16} className="mr-2" />
              Security
            </div>
          </button>
          <button className={`flex-1 min-w-[120px] px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'api' ? 'border-[#2C5B48] text-[#2C5B48]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('api')}>
            <div className="flex items-center justify-center">
              <DatabaseIcon size={16} className="mr-2" />
              API Integration
            </div>
          </button>
          <button className={`flex-1 min-w-[120px] px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'notifications' ? 'border-[#2C5B48] text-[#2C5B48]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('notifications')}>
            <div className="flex items-center justify-center">
              <BellIcon size={16} className="mr-2" />
              Notifications
            </div>
          </button>
        </div>
        <div className="pt-6">{renderTabContent()}</div>
      </Card>
    </div>
  );
};