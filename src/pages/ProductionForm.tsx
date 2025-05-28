
import React, { useState, useEffect } from 'react';
import { SaveIcon, RotateCcwIcon, BarChart2Icon } from 'lucide-react';
import { formatNumber } from '../utils/calculations';
import { useNotifications } from '../hooks/useNotifications';

// Interfaces
interface ProductSize {
  size: string;
  opening: number;
  weight: number; // kg per unit
}

interface HourlyProduction {
  hourSlot: string;
  machines: { [key: string]: string }; // e.g., { m1: '20L', m2: 'Inactive' }
  production: { [key: string]: number }; // e.g., { '20L': 100, '5L': 50 }
}

interface FormData {
  date: string;
  product: string;
  sizes: ProductSize[];
  hourlyData: HourlyProduction[];
}

interface Summary {
  sum: { [key: string]: number };
  wt: { [key: string]: number };
  mt: { [key: string]: number };
  percent: { [key: string]: number };
  totalMT: number;
}

// Card Component
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
    {children}
  </div>
);

// Default data
const defaultFormData: FormData = {
  date: new Date().toISOString().split('T')[0],
  product: 'PALM/SUN',
  sizes: [
    { size: '20L', opening: 2864, weight: 18.2 },
    { size: '20L S', opening: 306, weight: 18.2 },
    { size: '10L', opening: 2377, weight: 9.1 },
    { size: '5L', opening: 2019.75, weight: 18.2 },
    { size: '1L', opening: 747.58, weight: 10.92 },
    { size: '500ml', opening: 77, weight: 5.46 },
  ],
  hourlyData: Array.from({ length: 24 }, (_, i) => {
    const startHour = 7 + i;
    const endHour = (startHour + 1) % 24;
    return {
      hourSlot: `${startHour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:00`,
      machines: { m1: 'Inactive', m2: 'Inactive', m3: 'Inactive', m4: 'Inactive', m5: 'Inactive', m6: 'Inactive' },
      production: { '20L': 0, '20L S': 0, '10L': 0, '5L': 0, '1L': 0, '500ml': 0 },
    };
  }),
};

// Mock utilities
const calculatePercent = (qty: number, target: number): number => (target ? Number(((qty / target) * 100).toFixed(0)) : 0);

const BASE_URL = 'http://localhost:4000/api';

const ProductionTracker: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('productionTracker');
    return saved ? JSON.parse(saved) : defaultFormData;
  });
  const [activeTab, setActiveTab] = useState<'Stock' | 'Production' | 'Summary'>('Stock');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const { notifications, loading: notificationsLoading, addNotification } = useNotifications();

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('productionTracker', JSON.stringify(formData));
  }, [formData]);

  // Calculate summary
  const calculateSummary = (): Summary => {
    const sum: { [key: string]: number } = {};
    const wt: { [key: string]: number } = {};
    const mt: { [key: string]: number } = {};
    const percent: { [key: string]: number } = {};
    formData.sizes.forEach(size => {
      sum[size.size] = formData.hourlyData.reduce((acc, hour) => acc + (hour.production[size.size] || 0), 0);
      wt[size.size] = Number((sum[size.size] * size.weight).toFixed(3));
      mt[size.size] = Number((wt[size.size] / 1000).toFixed(2));
      percent[size.size] = calculatePercent(sum[size.size], size.opening);
    });
    const totalMT = Object.values(mt).reduce((acc, val) => acc + val, 0);
    return { sum, wt, mt, percent, totalMT };
  };

  const summary = calculateSummary();

  // Handle opening stock change
  const handleOpeningChange = (size: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => s.size === size ? { ...s, opening: parseFloat(value) || 0 } : s),
    }));
  };

  // Handle machine status change
  const handleMachineChange = (hourIndex: number, machine: string, value: string) => {
    setFormData(prev => {
      const newHourlyData = [...prev.hourlyData];
      newHourlyData[hourIndex].machines[machine] = value;
      return { ...prev, hourlyData: newHourlyData };
    });
  };

  // Handle production change
  const handleProductionChange = (hourIndex: number, size: string, value: string) => {
    setFormData(prev => {
      const newHourlyData = [...prev.hourlyData];
      newHourlyData[hourIndex].production[size] = parseFloat(value) || 0;
      return { ...prev, hourlyData: newHourlyData };
    });
  };

  // Reset form
  const handleResetForm = () => {
    setFormData({
      ...defaultFormData,
      date: new Date().toISOString().split('T')[0],
    });
    localStorage.removeItem('productionTracker');
    setShowResetConfirm(false);
    addNotification('Form reset successfully!', 'success');
  };

  // Preview submit
  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  // Confirm submit
  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          product: formData.product,
          sizes: formData.sizes,
          hourlyData: formData.hourlyData,
          summary,
          type: 'production_tracker',
        }),
      });
      const result = await response.json();
      if (result.status === 200) {
        addNotification('Production data tracked successfully!', 'success');
        setFormData({
          ...defaultFormData,
          date: new Date().toISOString().split('T')[0],
        });
        localStorage.removeItem('productionTracker');
        setShowPreview(false);
      } else {
        addNotification(result.message || 'Error tracking production data', 'error');
      }
    } catch (error) {
      console.error('Error tracking production data:', error);
      addNotification('Error tracking production data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BarChart2Icon className="mr-2 text-blue-600" size={24} />
            Production Tracker
          </h2>
          <p className="text-gray-600 text-sm">Monitor and manage production data</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-600 focus:border-blue-600"
          />
          <button
            className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setFormData({ ...formData, date: new Date().toISOString().split('T')[0] })}
          >
            Today
          </button>
          <button
            className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 1);
              setFormData({ ...formData, date: d.toISOString().split('T')[0] });
            }}
          >
            1d back
          </button>
          <button
            className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              setFormData({ ...formData, date: d.toISOString().split('T')[0] });
            }}
          >
            7d back
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <BarChart2Icon className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-800">{formData.sizes.length}</h3>
            <p className="text-xs text-gray-600">Sizes tracked</p>
          </div>
        </Card>
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <SaveIcon className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total MT</p>
            <h3 className="text-2xl font-bold text-gray-800">{summary.totalMT.toFixed(2)}</h3>
            <p className="text-xs text-gray-600">Metric Tons</p>
          </div>
        </Card>
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <BarChart2Icon className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Top Product</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {Object.entries(summary.sum).reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0])[0] || 'N/A'}
            </h3>
            <p className="text-xs text-gray-600">{formatNumber(Object.values(summary.sum).reduce((a, b) => Math.max(a, b), 0))} units</p>
          </div>
        </Card>
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <RotateCcwIcon className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Notifications</p>
            <h3 className="text-2xl font-bold text-gray-800">{notifications.length}</h3>
            <p className="text-xs text-gray-600">{notificationsLoading ? 'Loading...' : 'Recent updates'}</p>
          </div>
        </Card>
      </div>

      {/* Tabs and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Filters">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex border-b border-gray-200">
                {['Stock', 'Production', 'Summary'].map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setActiveTab(tab as 'Stock' | 'Production' | 'Summary')}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card title="Quick Actions">
            <div className="space-y-4">
              {[
                { to: '/preview', title: 'Preview Data', desc: 'View production summary' },
                { to: '/save', title: 'Save Data', desc: 'Submit production data' },
                { to: '/formulas', title: 'View Formulas', desc: 'Check calculation details' },
              ].map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  className="block p-4 rounded-lg border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">
                      <span className="text-lg font-bold">{item.title[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <button
              className="absolute right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all"
              onClick={() => setShowPreview(true)}
            >
              <SaveIcon size={24} />
            </button>
          </Card>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handlePreviewSubmit} className="space-y-6">
        {activeTab === 'Stock' && (
          <Card title="Opening Stock">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.sizes.map(size => (
                <div key={size.size} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{size.size}</label>
                  <input
                    type="number"
                    value={size.opening}
                    onChange={e => handleOpeningChange(size.size, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 text-sm transition-all duration-200"
                    step="0.01"
                    aria-label={`Opening stock for ${size.size}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'Production' && (
          <Card title="Hourly Production">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Machines</th>
                    {formData.sizes.map(size => (
                      <th key={size.size} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">{size.size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.hourlyData.map((hour, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-6 py-4 text-sm text-gray-800">{hour.hourSlot}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <select
                          value={Object.values(hour.machines).find(v => v !== 'Inactive') || 'Inactive'}
                          onChange={e => {
                            const value = e.target.value;
                            Object.keys(hour.machines).forEach(m => handleMachineChange(index, m, value));
                          }}
                          className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                          aria-label={`Machine status for ${hour.hourSlot}`}
                        >
                          <option value="Inactive">Inactive</option>
                          {formData.sizes.map(size => (
                            <option key={size.size} value={size.size}>{size.size}</option>
                          ))}
                        </select>
                      </td>
                      {formData.sizes.map(size => (
                        <td key={size.size} className="px-6 py-4 text-sm text-gray-800">
                          <input
                            type="number"
                            value={hour.production[size.size] || ''}
                            onChange={e => handleProductionChange(index, size.size, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-right text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                            step="0.01"
                            aria-label={`Production for ${size.size} at ${hour.hourSlot}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'Summary' && (
          <Card title="Production Summary">
            <div className="space-y-4">
              {formData.sizes.map(size => (
                <div key={size.size} className="p-4 bg-blue-50 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-800">{size.size}</h4>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {summary.percent[size.size]}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(summary.percent[size.size], 100)}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <p className="text-gray-600">Sum</p>
                      <p className="font-semibold text-gray-800">{formatNumber(summary.sum[size.size])}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">WT (kg)</p>
                      <p className="font-semibold text-gray-800">{formatNumber(summary.wt[size.size])}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">MT</p>
                      <p className="font-semibold text-gray-800">{summary.mt[size.size].toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-right font-semibold text-gray-800">
                Total MT: {summary.totalMT.toFixed(2)}
              </div>
            </div>
          </Card>
        )}

        {/* Summary Table */}
        <Card title="Production Summary Table">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Size</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Sum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">WT (kg)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">MT</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.sizes.map(size => (
                  <tr key={size.size} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{size.size}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatNumber(summary.sum[size.size])}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatNumber(summary.wt[size.size])}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">{summary.mt[size.size].toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">{summary.percent[size.size]}%</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">Total MT</td>
                  <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">
                    {summary.totalMT.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </form>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowResetConfirm(false)}
              aria-label="Close reset confirmation"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Reset Tracker?</h4>
            <p className="mb-6 text-gray-600 text-center">Are you sure you want to reset all data?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                onClick={handleResetForm}
              >
                Yes, Reset
              </button>
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >
              ×
            </button>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Preview Data</h4>
            <div className="overflow-y-auto max-h-96 space-y-4">
              <div>
                <p><strong>Date:</strong> {formData.date}</p>
                <p><strong>Product:</strong> {formData.product}</p>
              </div>
              <Card title="Opening Stock">
                <div className="grid grid-cols-2 gap-2">
                  {formData.sizes.map(size => (
                    <p key={size.size} className="text-sm text-gray-800">
                      <strong>{size.size}:</strong> {formatNumber(size.opening)}
                    </p>
                  ))}
                </div>
              </Card>
              <Card title="Hourly Production">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hour</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Machines</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Production</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.hourlyData
                        .filter(hour => Object.values(hour.production).some(v => v > 0))
                        .map((hour, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-800">{hour.hourSlot}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {Object.entries(hour.machines)
                                .filter(([_, v]) => v !== 'Inactive')
                                .map(([m, v]) => `${m}: ${v}`)
                                .join(', ')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {Object.entries(hour.production)
                                .filter(([_, v]) => v > 0)
                                .map(([s, v]) => `${s}: ${v}`)
                                .join(', ')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card title="Summary">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Size</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Sum</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">WT (kg)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">MT</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.sizes.map(size => (
                        <tr key={size.size} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800">{size.size}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatNumber(summary.sum[size.size])}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatNumber(summary.wt[size.size])}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 text-right">{summary.mt[size.size].toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 text-right">{summary.percent[size.size]}%</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">Total MT</td>
                        <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">
                          {summary.totalMT.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
                onClick={() => setShowPreview(false)}
              >
                Edit
              </button>
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                onClick={() => {
                  setShowPreview(false);
                  setShowConfirm(true);
                }}
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submission Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowConfirm(false)}
              aria-label="Close confirmation"
            >
              ×
            </button>
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-blue-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Confirm Save</h4>
              <p className="mb-6 text-gray-600 text-center">Save this production data?</p>
              <div className="flex gap-3">
                <button
                  className={`px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={handleConfirmSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Yes, Save'
                  )}
                </button>
                <button
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula Modal */}
      {showFormula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowFormula(false)}
              aria-label="Close explanation"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Calculations</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li><strong>Sum:</strong> Total units produced per size across all hours.</li>
              <li><strong>Weight (WT):</strong> Sum × Weight per unit (kg).</li>
              <li><strong>Metric Tons (MT):</strong> Weight (kg) / 1000.</li>
              <li><strong>Percent:</strong> Sum / Opening stock × 100.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionTracker;