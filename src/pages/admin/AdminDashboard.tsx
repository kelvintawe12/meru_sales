import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { UserIcon, BellIcon, FileTextIcon, SettingsIcon, BarChart2Icon, RefreshCcwIcon } from 'lucide-react';

const BASE_URL = "http://localhost:4000/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
}

interface StockSummary {
  date: string;
  totalQty: number;
  tanks: number;
}

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'notifications' | 'stocks' | 'settings'>('dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}?endpoint=admin/users`).then(res => res.json()),
      fetch(`${BASE_URL}?endpoint=notifications`).then(res => res.json()),
      fetch(`${BASE_URL}?endpoint=admin/stock-summary`).then(res => res.json())
    ]).then(([users, notifications, stockSummary]) => {
      setUsers(users);
      setNotifications(notifications);
      setStockSummary(stockSummary);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // User management actions
  const handleToggleUser = (userId: string) => {
    setUsers(users =>
      users.map(u => u.id === userId ? { ...u, active: !u.active } : u)
    );
    // Optionally, send to backend
    fetch(`${BASE_URL}?endpoint=admin/toggle-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId })
    }).catch(() => {});
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users =>
      users.map(u => u.id === userId ? { ...u, role: newRole } : u)
    );
    fetch(`${BASE_URL}?endpoint=admin/change-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole })
    }).catch(() => {});
  };

  // Notification actions
  const markNotificationRead = (id: string) => {
    setNotifications(notifications =>
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
    fetch(`${BASE_URL}?endpoint=notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
  };

  // Stock summary refresh
  const refreshStockSummary = () => {
    setLoading(true);
    fetch(`${BASE_URL}?endpoint=admin/stock-summary`)
      .then(res => res.json())
      .then(data => setStockSummary(data))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#2C5B48]">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded-md text-sm font-semibold ${activeTab === 'dashboard' ? 'bg-[#2C5B48] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2Icon size={16} className="inline mr-1" /> Dashboard
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm font-semibold ${activeTab === 'users' ? 'bg-[#2C5B48] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            <UserIcon size={16} className="inline mr-1" /> Users
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm font-semibold ${activeTab === 'notifications' ? 'bg-[#2C5B48] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <BellIcon size={16} className="inline mr-1" /> Notifications
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm font-semibold ${activeTab === 'stocks' ? 'bg-[#2C5B48] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('stocks')}
          >
            <FileTextIcon size={16} className="inline mr-1" /> Stocks
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm font-semibold ${activeTab === 'settings' ? 'bg-[#2C5B48] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={16} className="inline mr-1" /> Settings
          </button>
        </div>
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-3">
              <BarChart2Icon size={32} className="text-[#2C5B48]" />
              <div>
                <div className="text-lg font-bold">{stockSummary.length}</div>
                <div className="text-gray-600 text-sm">Stock Records</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <UserIcon size={32} className="text-[#2C5B48]" />
              <div>
                <div className="text-lg font-bold">{users.length}</div>
                <div className="text-gray-600 text-sm">Users</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <BellIcon size={32} className="text-[#2C5B48]" />
              <div>
                <div className="text-lg font-bold">{notifications.filter(n => !n.read).length}</div>
                <div className="text-gray-600 text-sm">Unread Notifications</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <Card title="User Management">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Role</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Active</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t border-gray-200">
                    <td className="px-3 py-2">{user.name}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option>Administrator</option>
                        <option>Operator</option>
                        <option>Viewer</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${user.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        className={`px-3 py-1 rounded text-xs font-semibold ${user.active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} border`}
                        onClick={() => handleToggleUser(user.id)}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <Card title="System Notifications">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-gray-500 p-4">No notifications.</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-center justify-between p-3 border-b border-gray-100 ${n.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                >
                  <div>
                    <div className="font-medium">{n.message}</div>
                    <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</div>
                  </div>
                  <button
                    className="ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                    onClick={() => markNotificationRead(n.id)}
                    disabled={n.read}
                  >
                    Mark as Read
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Stock Summary */}
      {activeTab === 'stocks' && (
        <Card title="Stock Records">
          <div className="flex justify-end mb-2">
            <button
              className="flex items-center gap-2 px-3 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
              onClick={refreshStockSummary}
            >
              <RefreshCcwIcon size={16} /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Total Qty (MT)</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Tanks</th>
                </tr>
              </thead>
              <tbody>
                {stockSummary.map(s => (
                  <tr key={s.date} className="border-t border-gray-200">
                    <td className="px-3 py-2">{s.date}</td>
                    <td className="px-3 py-2 text-right">{s.totalQty.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{s.tanks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <Card title="Admin Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={BASE_URL}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Version</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value="v1.0.0"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Contact</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value="support@refinery.com"
                readOnly
              />
            </div>
          </div>
        </Card>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="mb-2">
              <svg className="animate-spin h-8 w-8 text-[#2C5B48] mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
            <div className="text-[#2C5B48] font-semibold">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};