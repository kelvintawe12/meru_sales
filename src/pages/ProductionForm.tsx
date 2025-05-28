import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
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
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#2C5B48]">Production Tracker</h1>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-all font-semibold"
          onClick={() => setShowResetConfirm(true)}
        >
          <RotateCcwIcon size={18} />
          Reset
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['Stock', 'Production', 'Summary'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-[#2C5B48] text-[#2C5B48]'
                : 'text-gray-500 hover:text-[#2C5B48]'
            }`}
            onClick={() => setActiveTab(tab as 'Stock' | 'Production' | 'Summary')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <Card title="Notifications" className="animate-fade-in">
        {notificationsLoading ? (
          <div className="text-gray-600">Loading notifications...</div>
        ) : (
          <ul>
            {notifications.length === 0 || !notifications[0] ? (
              <li className="text-gray-600">No notifications</li>
            ) : (
              <li className="p-2 border rounded-md bg-green-50 text-green-900">
                <strong>{notifications[0]?.type?.toUpperCase() || 'NOTICE'}:</strong> {notifications[0]?.message || ''} {notifications[0]?.read ? '(Read)' : '(Unread)'}
                <em className="ml-2 text-xs text-gray-500">({notifications[0]?.timestamp || ''})</em>
              </li>
            )}
          </ul>
        )}
      </Card>

      {/* Form */}
      <form onSubmit={handlePreviewSubmit} className="space-y-6">
        {activeTab === 'Stock' && (
          <Card title="Opening Stock" className="animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {formData.sizes.map(size => (
                <div key={size.size} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{size.size}</label>
                  <input
                    type="number"
                    value={size.opening}
                    onChange={e => handleOpeningChange(size.size, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48] text-sm"
                    step="0.01"
                    aria-label={`Opening stock for ${size.size}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'Production' && (
          <Card title="Hourly Production" className="animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left text-sm">Hour</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-sm">Machines</th>
                    {formData.sizes.map(size => (
                      <th key={size.size} className="border border-gray-300 px-2 py-1 text-sm">{size.size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.hourlyData.map((hour, index) => (
                    <tr key={index} className="border-t border-gray-300 hover:bg-gray-50 transition">
                      <td className="border border-gray-300 px-2 py-1 text-sm">{hour.hourSlot}</td>
                      <td className="border border-gray-300 px-2 py-1 text-sm">
                        <select
                          value={Object.values(hour.machines).find(v => v !== 'Inactive') || 'Inactive'}
                          onChange={e => {
                            const value = e.target.value;
                            Object.keys(hour.machines).forEach(m => handleMachineChange(index, m, value));
                          }}
                          className="p-1 border border-gray-300 rounded-md text-sm"
                          aria-label={`Machine status for ${hour.hourSlot}`}
                        >
                          <option value="Inactive">Inactive</option>
                          {formData.sizes.map(size => (
                            <option key={size.size} value={size.size}>{size.size}</option>
                          ))}
                        </select>
                      </td>
                      {formData.sizes.map(size => (
                        <td key={size.size} className="border border-gray-300 px-2 py-1 text-sm">
                          <input
                            type="number"
                            value={hour.production[size.size] || ''}
                            onChange={e => handleProductionChange(index, size.size, e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded-md text-right text-sm"
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
          <Card title="Production Summary" className="animate-slide-up">
            <div className="space-y-4">
              {formData.sizes.map(size => (
                <div key={size.size} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">{size.size}</h4>
                    <span className="text-xs bg-[#2C5B48] text-white px-2 py-1 rounded">
                      {summary.percent[size.size]}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#2C5B48] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(summary.percent[size.size], 100)}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <p className="text-gray-600">Sum</p>
                      <p className="font-semibold">{formatNumber(summary.sum[size.size])}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">WT (kg)</p>
                      <p className="font-semibold">{formatNumber(summary.wt[size.size])}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">MT</p>
                      <p className="font-semibold">{summary.mt[size.size].toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-right font-semibold text-[#2C5B48]">
                Total MT: {summary.totalMT.toFixed(2)}
              </div>
            </div>
          </Card>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-2 rounded-lg font-semibold bg-blue-100 text-blue-700 border border-blue-300 shadow hover:bg-blue-200 hover:scale-105 transition-all duration-200"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-6 py-2 rounded-lg font-semibold shadow-sm transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#2C5B48] text-white hover:bg-[#224539]'
            }`}
          >
            <SaveIcon size={18} className="mr-2" />
            {isLoading ? 'Submitting...' : 'Save Data'}
          </button>
        </div>
      </form>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowResetConfirm(false)}
              aria-label="Close reset confirmation"
            >
              ×
            </button>
            <h4 className="text-lg font-bold mb-4 text-[#2C5B48]">Reset Tracker?</h4>
            <p className="mb-6 text-gray-700 text-center">Are you sure you want to reset all data?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-red-600 text-white shadow hover:bg-red-700"
                onClick={handleResetForm}
              >
                Yes, Reset
              </button>
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 animate-slide-up">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >
              ×
            </button>
            <h4 className="text-xl font-bold mb-4 text-[#2C5B48]">Preview Data</h4>
            <div className="overflow-y-auto max-h-96">
              <div className="mb-4">
                <p><strong>Date:</strong> {formData.date}</p>
                <p><strong>Product:</strong> {formData.product}</p>
              </div>
              <h5 className="font-semibold text-[#2C5B48] mb-2">Opening Stock</h5>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {formData.sizes.map(size => (
                  <p key={size.size}><strong>{size.size}:</strong> {formatNumber(size.opening)}</p>
                ))}
              </div>
              <h5 className="font-semibold text-[#2C5B48] mb-2">Hourly Production</h5>
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Hour</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Machines</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Production</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.hourlyData
                    .filter(hour => Object.values(hour.production).some(v => v > 0))
                    .map((hour, index) => (
                      <tr key={index}>
                        <td className="px-2 py-1 text-gray-600">{hour.hourSlot}</td>
                        <td className="px-2 py-1 text-gray-600">
                          {Object.entries(hour.machines)
                            .filter(([_, v]) => v !== 'Inactive')
                            .map(([m, v]) => `${m}: ${v}`)
                            .join(', ')}
                        </td>
                        <td className="px-2 py-1 text-gray-600">
                          {Object.entries(hour.production)
                            .filter(([_, v]) => v > 0)
                            .map(([s, v]) => `${s}: ${v}`)
                            .join(', ')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <h5 className="font-semibold text-[#2C5B48] mt-4 mb-2">Summary</h5>
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Size</th>
                    <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">Sum</th>
                    <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">WT (kg)</th>
                    <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">MT</th>
                    <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">%</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.sizes.map(size => (
                    <tr key={size.size}>
                      <td className="px-2 py-1 text-gray-600">{size.size}</td>
                      <td className="px-2 py-1 text-gray-900 text-right">{formatNumber(summary.sum[size.size])}</td>
                      <td className="px-2 py-1 text-gray-900 text-right">{formatNumber(summary.wt[size.size])}</td>
                      <td className="px-2 py-1 text-gray-900 text-right">{summary.mt[size.size].toFixed(2)}</td>
                      <td className="px-2 py-1 text-gray-900 text-right">{summary.percent[size.size]}%</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-2 py-1 text-gray-600 font-semibold">Total MT</td>
                    <td colSpan={4} className="px-2 py-1 text-gray-900 text-right font-semibold">
                      {summary.totalMT.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300 hover:scale-105 transition-all"
                onClick={() => setShowPreview(false)}
              >
                Edit
              </button>
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#2C5B48] to-[#22c55e] text-white shadow-md hover:scale-105 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-bounce-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowConfirm(false)}
              aria-label="Close confirmation"
            >
              ×
            </button>
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-green-400 mb-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              <h4 className="text-xl font-bold mb-2 text-[#2C5B48]">Confirm Save</h4>
              <p className="mb-6 text-gray-700 text-center">Save this production data?</p>
              <div className="flex gap-3">
                <button
                  className={`px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#2C5B48] to-[#22c55e] text-white shadow-md hover:scale-105 transition-all ${
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
                    <span className="inline-block animate-pulse">Yes, Save</span>
                  )}
                </button>
                <button
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300 hover:scale-105 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowFormula(false)}
              aria-label="Close explanation"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold mb-2 text-[#2C5B48]">Calculations</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
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