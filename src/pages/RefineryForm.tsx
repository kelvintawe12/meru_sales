import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { SaveIcon, CalculatorIcon, RotateCcwIcon } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const BASE_URL = "http://localhost:4000/api";

export const RefineryForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [editCalculated, setEditCalculated] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const defaultFormData = {
    date: new Date().toISOString().split('T')[0],
    rt: '',
    bleacher: '',
    plf: '',
    bot: '',
    deaerator: '',
    vhe: '',
    deo: '',
    openingWIP: '',
    closingWIP: '',
    refineryFeed: '',
    bleachingEarth: '',
    phosphoricAcid: '',
    citricAcid: '',
    feedFFA: '',
    cpol: '',
    moisture: '',
    oilInSpentEarth: '',
    oilInPFAD: '',
    finalOilFFA: '',
    actualCPOL: '',
    feedMT: '',
    refinedOilMT: '',
    pfadProductionMT: '',
    lossMT: ''
  };

  const [formData, setFormData] = useState(defaultFormData);

  const { notifications, loading } = useNotifications();

  // Offline caching
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cached = localStorage.getItem('refineryForm');
    if (cached) setFormData(JSON.parse(cached));
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('refineryForm', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateValues = () => {
    const feedMT = parseFloat(formData.refineryFeed) || 0;
    const refinedOilMT = feedMT * 0.955;
    const pfadProductionMT = feedMT * 0.039;
    const lossMT = feedMT * 0.006;
    setFormData(prev => ({
      ...prev,
      feedMT: feedMT ? feedMT.toFixed(2) : '',
      refinedOilMT: feedMT ? refinedOilMT.toFixed(2) : '',
      pfadProductionMT: feedMT ? pfadProductionMT.toFixed(2) : '',
      lossMT: feedMT ? lossMT.toFixed(2) : ''
    }));
  };

  useEffect(() => {
    const feedMT = parseFloat(formData.refineryFeed) || 0;
    if (!formData.refineryFeed) {
      setFormData(prev => ({
        ...prev,
        feedMT: '',
        refinedOilMT: '',
        pfadProductionMT: '',
        lossMT: ''
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      feedMT: feedMT.toFixed(2),
      refinedOilMT: (feedMT * 0.955).toFixed(2),
      pfadProductionMT: (feedMT * 0.039).toFixed(2),
      lossMT: (feedMT * 0.006).toFixed(2)
    }));
    // eslint-disable-next-line
  }, [formData.refineryFeed]);

  // Preview and confirmation logic
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
          body: JSON.stringify({ ...formData, type: 'refinery' })
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        alert('Form submitted successfully!');
        setFormData({
          ...defaultFormData,
          date: new Date().toISOString().split('T')[0]
        });
        localStorage.removeItem('refineryForm');
      } else {
        alert(result.message || 'Error submitting form!');
      }
    } catch (error) {
      alert('Error submitting form!');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form handler
  const handleResetForm = () => {
    setFormData({
      ...defaultFormData,
      date: new Date().toISOString().split('T')[0]
    });
    localStorage.removeItem('refineryForm');
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-all font-semibold"
          onClick={() => setShowResetConfirm(true)}
        >
          <RotateCcwIcon size={18} />
          Reset Form
        </button>
      </div>

      {/* Confirm Reset Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-bounce-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl transition"
              onClick={() => setShowResetConfirm(false)}
              aria-label="Close reset confirmation"
            >&times;</button>
            <h4 className="text-lg font-bold mb-4 text-[#2C5B48]">Reset Form?</h4>
            <p className="mb-6 text-gray-700 text-center">
              Are you sure you want to reset the entire form? All unsaved data will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-red-600 text-white shadow hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={handleResetForm}
              >
                Yes, Reset
              </button>
              <button
                className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
      {/* Refinery Form Section */}
      <Card title="Refinery Data Entry Form">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                placeholder="Select date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">Process Units</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'rt', label: 'RT', placeholder: 'Enter value (%)', unit: '%' },
                { name: 'bleacher', label: 'BLEACHER', placeholder: 'Enter value (%)', unit: '%' },
                { name: 'plf', label: 'PLF', placeholder: 'Enter value (%)', unit: '%' },
                { name: 'bot', label: 'BOT', placeholder: 'Enter value (%)', unit: '%' },
                { name: 'deaerator', label: 'DEAERATOR', placeholder: 'Enter value (%)', unit: '%' },
                { name: 'vhe', label: 'VHE', placeholder: 'Enter value (%)', unit: '%' },
                { name: 'deo', label: 'DEO', placeholder: 'Enter value (%)', unit: '%' }
              ].map(({ name, label, placeholder, unit }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} <span className="text-xs text-gray-400">({unit})</span>
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    step="0.01"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">Refinery Feed & WIP</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'openingWIP', label: 'Opening WIP', placeholder: 'Enter value in MT', unit: 'MT' },
                { name: 'refineryFeed', label: 'Refinery Feed (MT)', placeholder: 'Enter value in MT', unit: 'MT' },
                { name: 'closingWIP', label: 'Closing WIP', placeholder: 'Enter value in MT', unit: 'MT' }
              ].map(({ name, label, placeholder, unit }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} <span className="text-xs text-gray-400">({unit})</span>
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">Additives</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'bleachingEarth', label: 'Bleaching Earth (kgs)' },
                { name: 'phosphoricAcid', label: 'Phosphoric Acid (kgs)' },
                { name: 'citricAcid', label: 'Citric Acid (kgs)' }
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder="Enter value in kgs"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">Quality Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'feedFFA', label: 'Feed FFA%', placeholder: 'Enter value in %' },
                { name: 'cpol', label: 'CPOL', placeholder: 'Enter value' },
                { name: 'moisture', label: 'Moisture %', placeholder: 'Enter value in %' },
                { name: 'oilInSpentEarth', label: 'Oil % in Spent Earth', placeholder: 'Enter value in %' },
                { name: 'oilInPFAD', label: 'Oil % in PFAD', placeholder: 'Enter value in %' },
                { name: 'finalOilFFA', label: 'Final Oil FFA%', placeholder: 'Enter value in %' }
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                Calculated Results
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded text-xs bg-gray-100 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all duration-150"
                  onClick={() => setEditCalculated(e => !e)}
                  aria-label={editCalculated ? "Disable manual edit" : "Enable manual edit"}
                >
                  {editCalculated ? "Lock" : "Edit"}
                </button>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  <strong>Formulas:</strong>
                  <ul className="list-disc ml-4">
                    <li>Refined Oil (MT): <code>Feed × 0.955</code></li>
                    <li>PFAD Production (MT): <code>Feed × 0.039</code></li>
                    <li>Loss (MT): <code>Feed × 0.006</code></li>
                  </ul>
                </span>
                <button
                  type="button"
                  onClick={() => setShowExplanation(true)}
                  className="ml-2 text-xs underline text-[#2C5B48] hover:text-[#224539] focus:outline-none"
                  aria-label="Show calculation explanation"
                >
                  Why these values?
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'feedMT', label: 'Feed (MT)' },
                { name: 'refinedOilMT', label: 'Refined Oil (MT)' },
                { name: 'pfadProductionMT', label: 'PFAD Production (MT)' },
                { name: 'lossMT', label: 'Loss (MT)' }
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    readOnly={!editCalculated}
                    onChange={handleChange}
                    className={`w-full p-2 ${editCalculated ? 'bg-white border-blue-400' : 'bg-gray-50'} border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]`}
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={calculateValues}
              className="inline-flex items-center justify-center px-6 py-2 rounded-md font-semibold shadow-sm transition-colors
                bg-white border border-[#2C5B48] text-[#2C5B48] hover:bg-[#e6f2ee] focus:outline-none focus:ring-2 focus:ring-[#2C5B48]"
            >
              <CalculatorIcon size={18} className="mr-2" />
              Calculate
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center justify-center px-6 py-2 rounded-md font-semibold shadow-sm transition-colors
                bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
            >
              Preview
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center justify-center px-6 py-2 rounded-md font-semibold shadow-sm transition-colors
                ${isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2C5B48] text-white hover:bg-[#224539]'
                } focus:outline-none focus:ring-2 focus:ring-[#2C5B48]`}
            >
              <SaveIcon size={18} className="mr-2" />
              {isLoading ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </form>
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
        {/* Explanation Popup */}
        {showExplanation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setShowExplanation(false)}
                aria-label="Close explanation"
              >
                &times;
              </button>
              <h4 className="text-lg font-semibold mb-2 text-[#2C5B48]">Justification of Calculation Factors</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                <li>
                  <strong>0.955 (Refined Oil):</strong> This factor represents the typical yield of refined oil from the total feed processed in palm oil refineries. It means that, on average, <b>95.5%</b> of the feed is converted into refined oil, accounting for standard process efficiency.
                </li>
                <li>
                  <strong>0.039 (PFAD):</strong> This value reflects the expected proportion of Palm Fatty Acid Distillate (PFAD) produced during refining. About <b>3.9%</b> of the feed is separated as PFAD, based on industry norms.
                </li>
                <li>
                  <strong>0.006 (Loss):</strong> This factor accounts for typical process losses (such as evaporation, handling, and minor residues), which are estimated at <b>0.6%</b> of the total feed.
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                These coefficients are based on standard industry yields for palm oil refining. Actual values may vary depending on process conditions and raw material quality.
              </p>
            </div>
          </div>
        )}
        {/* Offline Banner */}
        {isOffline && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow z-50">
            You are offline. Your form data is saved and will be available when you return.
          </div>
        )}
      </Card>
    </div>
  );
};
