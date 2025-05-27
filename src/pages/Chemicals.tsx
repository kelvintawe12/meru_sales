import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { SaveIcon } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

// Defining types for chemicals and form data
type Chemical = {
  quantity: string;
  dosage: string;
};
type ChemicalsFormData = {
  date: string;
  feedMT: string;
  bleachingEarth: Chemical;
  phosphoricAcid: Chemical;
  citricAcid: Chemical;
};

const defaultFormData: ChemicalsFormData = {
  date: new Date().toISOString().split('T')[0],
  feedMT: '',
  bleachingEarth: { quantity: '', dosage: '' },
  phosphoricAcid: { quantity: '', dosage: '' },
  citricAcid: { quantity: '', dosage: '' }
};

export const Chemicals: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<ChemicalsFormData>(defaultFormData);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { notifications, loading: notificationsLoading, addNotification } = useNotifications();

  // Offline caching: restore on mount
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cached = localStorage.getItem('chemicalsForm');
    if (cached) setFormData(JSON.parse(cached));
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Offline caching: save on change
  useEffect(() => {
    localStorage.setItem('chemicalsForm', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const fetchLatest = async () => {
      setFetching(true);
      try {
        const res = await fetch('http://localhost:4000/api?endpoint=chemicals');
        if (!res.ok) throw new Error('Failed to fetch chemical data');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          setFormData({
            date: latest.date || defaultFormData.date,
            feedMT: latest.feedMT?.toString() || '',
            bleachingEarth: {
              quantity: latest.bleachingEarth?.quantity?.toString() || '',
              dosage: latest.bleachingEarth?.dosage?.toString() || ''
            },
            phosphoricAcid: {
              quantity: latest.phosphoricAcid?.quantity?.toString() || '',
              dosage: latest.phosphoricAcid?.dosage?.toString() || ''
            },
            citricAcid: {
              quantity: latest.citricAcid?.quantity?.toString() || '',
              dosage: latest.citricAcid?.dosage?.toString() || ''
            }
          });
        } else {
          setFormData(defaultFormData);
          addNotification('No previous chemical data found. Using defaults.', 'info');
        }
      } catch (error) {
        setFormData(defaultFormData);
        addNotification('Could not fetch chemical data. Using defaults.', 'warning');
      } finally {
        setFetching(false);
      }
    };
    fetchLatest();
    // eslint-disable-next-line
  }, []);

  // Helper to safely get chemical object
  const getChemical = (id: keyof ChemicalsFormData) => {
    const chem = formData[id];
    if (typeof chem === 'object' && chem !== null && 'quantity' in chem && 'dosage' in chem) {
      return chem as Chemical;
    }
    return { quantity: '', dosage: '' };
  };

  // Automatically calculate dosages when feedMT or any chemical quantity changes
  useEffect(() => {
    const feedMT = parseFloat(formData.feedMT) || 0;
    if (feedMT === 0) {
      setFormData(prev => ({
        ...prev,
        bleachingEarth: { ...prev.bleachingEarth, dosage: '' },
        phosphoricAcid: { ...prev.phosphoricAcid, dosage: '' },
        citricAcid: { ...prev.citricAcid, dosage: '' }
      }));
      return;
    }
    const clamp = (val: number) => Math.min(100, val);

    setFormData(prev => ({
      ...prev,
      bleachingEarth: {
        ...prev.bleachingEarth,
        dosage:
          prev.bleachingEarth.quantity && feedMT
            ? clamp((parseFloat(prev.bleachingEarth.quantity) / feedMT) * 100).toFixed(2)
            : ''
      },
      phosphoricAcid: {
        ...prev.phosphoricAcid,
        dosage:
          prev.phosphoricAcid.quantity && feedMT
            ? clamp((parseFloat(prev.phosphoricAcid.quantity) / feedMT) * 100).toFixed(2)
            : ''
      },
      citricAcid: {
        ...prev.citricAcid,
        dosage:
          prev.citricAcid.quantity && feedMT
            ? clamp((parseFloat(prev.citricAcid.quantity) / feedMT) * 100).toFixed(2)
            : ''
      }
    }));
  }, [
    formData.feedMT,
    formData.bleachingEarth.quantity,
    formData.phosphoricAcid.quantity,
    formData.citricAcid.quantity
  ]);

  const handleChange = (chemical: keyof ChemicalsFormData, field: 'quantity' | 'dosage', value: string) => {
    setFormData(prev => ({
      ...prev,
      [chemical]: {
        ...(prev[chemical] as Chemical),
        [field]: value
      }
    }));
  };

  const handleFeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      feedMT: e.target.value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      date: e.target.value
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
        'http://localhost:4000/api',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            type: 'chemicals'
          })
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        addNotification('Chemical data submitted successfully!', 'success');
        setFormData(defaultFormData); // Reset form on success
        localStorage.removeItem('chemicalsForm');
      } else {
        addNotification(result.message || 'Error submitting chemical data', 'error');
      }
    } catch (error) {
      addNotification('Error submitting chemical data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <Card title="Notifications">
        {notificationsLoading ? (
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
      <Card title="Chemical Consumption Entry">
        {fetching ? (
          <div>Loading latest chemical data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed (MT)
                </label>
                <input
                  type="number"
                  value={formData.feedMT}
                  onChange={handleFeedChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                  required
                  step="0.01"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-800">
                  Chemical Consumption
                </h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  Formula: <code>(Quantity (kg) / Feed (MT)) × 100</code>
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Particulars
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty (kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % Dosage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {([
                      { id: 'bleachingEarth', label: 'Bleaching Earth' },
                      { id: 'phosphoricAcid', label: 'Phosphoric Acid' },
                      { id: 'citricAcid', label: 'Citric Acid' }
                    ] as const).map(chemical => (
                      <tr key={chemical.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {chemical.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="number"
                            value={getChemical(chemical.id).quantity}
                            onChange={e => handleChange(chemical.id, 'quantity', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={getChemical(chemical.id).dosage}
                            readOnly
                            className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md"
                            placeholder="%"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-6 py-2 rounded-lg font-semibold bg-blue-100 text-blue-700 border border-blue-300 shadow hover:bg-blue-200 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setShowPreview(true)}
              >
                Preview
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-6 py-2 rounded-lg font-semibold shadow-sm transition-colors
                  ${isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#2C5B48] text-white hover:bg-[#224539] hover:scale-105'
                  } focus:outline-none focus:ring-2 focus:ring-[#2C5B48]`}
              >
                <SaveIcon size={18} className="mr-2" />
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
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
                  <tr>
                    <td className="px-4 py-2 text-gray-600">Date</td>
                    <td className="px-4 py-2 text-gray-900">{formData.date}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-600">Feed (MT)</td>
                    <td className="px-4 py-2 text-gray-900">{formData.feedMT}</td>
                  </tr>
                  {([
                    { id: 'bleachingEarth', label: 'Bleaching Earth' },
                    { id: 'phosphoricAcid', label: 'Phosphoric Acid' },
                    { id: 'citricAcid', label: 'Citric Acid' }
                  ] as const).map(chemical => (
                    <React.Fragment key={chemical.id}>
                      <tr>
                        <td className="px-4 py-2 text-gray-600">{chemical.label} Qty (kg)</td>
                        <td className="px-4 py-2 text-gray-900">{getChemical(chemical.id).quantity}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-600">{chemical.label} % Dosage</td>
                        <td className="px-4 py-2 text-gray-900">{getChemical(chemical.id).dosage}</td>
                      </tr>
                    </React.Fragment>
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