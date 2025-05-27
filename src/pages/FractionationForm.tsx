import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SaveIcon, CalculatorIcon } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const BASE_URL = "http://localhost:4000/api";

export const FractionationForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showFormula, setShowFormula] = useState(false);
  const [editCalculated, setEditCalculated] = useState(false);

  // Define default form data for easy reset
  const defaultFormData = {
    date: new Date().toISOString().split('T')[0],
    clx1: '',
    clx2: '',
    clx3: '',
    clx4: '',
    squeezingTank: '',
    oleinTank: '',
    stearinHopper: '',
    openingWIP: '',
    fractionationFeed: '',
    closingWIP: '',
    oleinMT: '',
    stearinMT: '',
    phenomolConsumption: '',
    oleinPercentage: '',
    stearinPercentage: ''
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Notifications hook
  const { notifications, loading } = useNotifications();

  // Offline caching: restore on mount
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cached = localStorage.getItem('fractionationForm');
    if (cached) setFormData(JSON.parse(cached));
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Offline caching: save on change
  useEffect(() => {
    localStorage.setItem('fractionationForm', JSON.stringify(formData));
  }, [formData]);

  // Calculation logic: auto-calculate when feed or outputs change
  useEffect(() => {
    const feed = parseFloat(formData.fractionationFeed) || 0;
    const olein = parseFloat(formData.oleinMT) || 0;
    const stearin = parseFloat(formData.stearinMT) || 0;

    let oleinPct = '';
    let stearinPct = '';

    const clamp = (val: number) => Math.min(100, val);

    if (feed > 0) {
      if (olein > 0) oleinPct = clamp((olein / feed) * 100).toFixed(2);
      if (stearin > 0) stearinPct = clamp((stearin / feed) * 100).toFixed(2);
    }

    setFormData(prev => ({
      ...prev,
      oleinPercentage: oleinPct,
      stearinPercentage: stearinPct
    }));
    // eslint-disable-next-line
  }, [formData.fractionationFeed, formData.oleinMT, formData.stearinMT]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      const response = await fetch(
        BASE_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            type: 'fractionation'
          })
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        alert('Form submitted successfully!');
        setFormData({
          ...defaultFormData,
          date: new Date().toISOString().split('T')[0]
        });
        localStorage.removeItem('fractionationForm');
      } else {
        alert(result.message || 'Error submitting form!');
      }
    } catch (error) {
      alert('Error submitting form!');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual calculation (optional, for the Calculate button)
  const calculateValues = () => {
    const feed = parseFloat(formData.fractionationFeed) || 0;
    if (feed > 0) {
      const oleinMT = feed * 0.85;
      const stearinMT = feed * 0.15;
      setFormData(prev => ({
        ...prev,
        oleinMT: oleinMT.toFixed(2),
        stearinMT: stearinMT.toFixed(2),
        oleinPercentage: '85.00',
        stearinPercentage: '15.00'
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <Card title="Notifications">
        {loading ? (
          <div>Loading notifications...</div>
        ) : (
          <ul>
            {notifications.length === 0 ? null : (
              <li key={notifications[0].id} className="p-2 border rounded-md bg-green-50 text-green-900">
                <strong>{notifications[0].type.toUpperCase()}:</strong> {notifications[0].message} {notifications[0].read ? '(Read)' : '(Unread)'} <em className="ml-2 text-xs text-gray-500">({notifications[0].timestamp})</em>
              </li>
            )}
          </ul>
        )}
      </Card>
      {/* Fractionation Form Section */}
      <Card title="Fractionation Data Entry Form">
        {/* Formula and Learn More */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-700">
            <strong>Formulas:</strong>
            <ul className="list-disc ml-5 mt-1">
              <li>
                <b>Olein (MT):</b> <code>Feed × 0.85</code>
              </li>
              <li>
                <b>Stearin (MT):</b> <code>Feed × 0.15</code>
              </li>
              <li>
                <b>Olein %:</b> <code>(Olein / Feed) × 100</code>
              </li>
              <li>
                <b>Stearin %:</b> <code>(Stearin / Feed) × 100</code>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setShowFormula(true)}
            className="text-xs underline text-[#2C5B48] hover:text-[#224539] focus:outline-none mt-2 md:mt-0"
          >
            Learn more about these calculations
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" required />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">
              Process Units
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['clx1', 'clx2', 'clx3', 'clx4', 'squeezingTank', 'oleinTank', 'stearinHopper'].map(name => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">
              Fractionation Feed & WIP
            </h3>
            <span className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600 mb-2 inline-block">
              Formula: <code>Feed = Opening WIP + Input - Closing WIP</code>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening WIP
                </label>
                <input type="number" name="openingWIP" value={formData.openingWIP} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fractionation Feed (MT)
                </label>
                <input type="number" name="fractionationFeed" value={formData.fractionationFeed} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing WIP
                </label>
                <input type="number" name="closingWIP" value={formData.closingWIP} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">
              Output & Additives
            </h3>
            <span className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600 mb-2 inline-block">
              Formula: <code>Olein (MT) = Feed × 0.85</code>, <code>Stearin (MT) = Feed × 0.15</code>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Olein (MT)
                </label>
                <input type="number" name="oleinMT" value={formData.oleinMT} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stearin (MT)
                </label>
                <input type="number" name="stearinMT" value={formData.stearinMT} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phenomol Consumption (kgs)
                </label>
                <input type="number" name="phenomolConsumption" value={formData.phenomolConsumption} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                Calculated Results
                <button
                  type="button"
                  className={`ml-2 px-2 py-1 rounded text-xs border transition-all duration-150 ${
                    editCalculated
                      ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                      : 'bg-gray-100 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => setEditCalculated(e => !e)}
                  aria-label={editCalculated ? "Lock Calculated Fields" : "Edit Calculated Fields"}
                >
                  {editCalculated ? "Lock" : "Edit"}
                </button>
              </h3>
              <span className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600 mb-2 inline-block">
                Formula: <code>Olein % = (Olein / Feed) × 100</code>, <code>Stearin % = (Stearin / Feed) × 100</code>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Olein %
                </label>
                <input
                  type="text"
                  name="oleinPercentage"
                  value={formData.oleinPercentage}
                  readOnly={!editCalculated}
                  onChange={handleChange}
                  className={`w-full p-2 border border-gray-300 rounded-md ${editCalculated ? 'bg-white border-blue-400' : 'bg-gray-50'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stearin %
                </label>
                <input
                  type="text"
                  name="stearinPercentage"
                  value={formData.stearinPercentage}
                  readOnly={!editCalculated}
                  onChange={handleChange}
                  className={`w-full p-2 border border-gray-300 rounded-md ${editCalculated ? 'bg-white border-blue-400' : 'bg-gray-50'}`}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="secondary"
              icon={<CalculatorIcon size={18} />}
              onClick={calculateValues}
              className="bg-white border border-[#2C5B48] text-[#2C5B48] hover:bg-[#e6f2ee] focus:outline-none focus:ring-2 focus:ring-[#2C5B48]"
            >
              Calculate
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              icon={<SaveIcon size={18} />}
              className="bg-[#2C5B48] text-white hover:bg-[#224539] focus:outline-none focus:ring-2 focus:ring-[#2C5B48]"
            >
              Submit Form
            </Button>
          </div>
        </form>
        {/* Formula Explanation Popup */}
        {showFormula && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setShowFormula(false)}
                aria-label="Close explanation"
              >
                &times;
              </button>
              <h4 className="text-lg font-semibold mb-2 text-[#2C5B48]">Fractionation Calculations Explained</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                <li>
                  <strong>Olein (MT):</strong> Calculated as 85% of the feed input, based on typical industry yield.
                </li>
                <li>
                  <strong>Stearin (MT):</strong> Calculated as 15% of the feed input, based on typical industry yield.
                </li>
                <li>
                  <strong>Olein %:</strong> <code>(Olein / Feed) × 100</code> gives the percentage yield of Olein from the feed.
                </li>
                <li>
                  <strong>Stearin %:</strong> <code>(Stearin / Feed) × 100</code> gives the percentage yield of Stearin from the feed.
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                These formulas are based on standard palm oil fractionation process yields. Actual results may vary depending on process conditions and feed quality.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 relative animate-slide-up">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl transition"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >&times;</button>
            <h4 className="text-xl font-bold mb-4 text-[#2C5B48]">Preview Submission</h4>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Field</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(formData).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                      <td className="px-4 py-2 text-gray-900">{value || <span className="text-gray-400 italic">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#2C5B48] to-[#22c55e] text-white shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C5B48]"
                onClick={() => { setShowPreview(false); setShowConfirm(true); }}
              >
                <span className="inline-block animate-pulse">Confirm &amp; Submit</span>
              </button>
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => setShowPreview(false)}
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submission Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative animate-bounce-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl transition"
              onClick={() => setShowConfirm(false)}
              aria-label="Close confirmation"
            >&times;</button>
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-green-400 mb-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              <h4 className="text-xl font-bold mb-2 text-[#2C5B48]">Confirm Submission</h4>
              <p className="mb-6 text-gray-700 text-center">Are you sure you want to submit this form?</p>
              <div className="flex gap-3">
                <button
                  className={`px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#2C5B48] to-[#22c55e] text-white shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C5B48] ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="inline-block animate-pulse">Yes, Submit</span>
                  )}
                </button>
                <button
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
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

      {/* Offline Banner */}
      {isOffline && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow z-50">
          You are offline. Your form data is saved and will be available when you return.
        </div>
      )}
    </div>
  );
};