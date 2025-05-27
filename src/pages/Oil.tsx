import React, { useState, useEffect } from 'react';
import { SaveIcon, CalculatorIcon, RotateCcwIcon } from 'lucide-react';

// Product weights (from prior production data)
const PRODUCT_WEIGHTS: { [key: string]: number } = {
  '20L': 18.200,
  '250ML Promo (pc)': 5.460,
  '250ML Promo (box)': 5.460 * 24, // Assuming 24 pieces per box
  '20L SQ.': 18.200,
  '10L': 9.100,
  '5L': 18.200,
  '3L': 16.380,
  '1L': 10.920,
  'Sunflower 1L': 11.004,
  '250ML': 5.460,
  '500ML': 5.460,
  '500ML Sunflower': 5.502
};

// Sample dropdown options
const DISPATCH_TO_OPTIONS = ['CUSTOMER', 'DEPOT', 'EXPORT'];
const TRUCK_STATUS_OPTIONS = ['Loaded', 'In Transit', 'Delivered', 'Returned'];
const TRANSPORTER_OPTIONS = ['TransCorp', 'LogiFreight', 'SwiftTrans', 'GlobalMove'];
const CUSTOMER_DEPOT_OPTIONS = ['Depot A', 'Depot B', 'Customer Alpha', 'Customer Beta', 'Export Hub'];

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzuyhsb1VsdCEPyqOTXjHSU9bE6-yv6sfLtHGN8Jda6YLP1YpdyeOk6Wheyi6OGa3yt4Q/exec';

interface FormData {
  date: string;
  serialNo: string;
  salesOrderNo: string;
  ticketNo: string;
  invoiceNo: string;
  truckNo: string;
  driverNo: string;
  transporter: string;
  dispatchTo: string;
  customerDepotName: string;
  '20L': string;
  '250ML Promo (pc)': string;
  '250ML Promo (box)': string;
  '20L SQ.': string;
  '10L': string;
  '5L': string;
  '3L': string;
  '1L': string;
  'Sunflower 1L': string;
  '250ML': string;
  '500ML': string;
  '500ML Sunflower': string;
  mt: string;
  truckStatus: string;
  gatePassNo: string;
}

interface ApiResponse {
  status: number;
  message?: string;
  data?: FormData;
}

const Oil: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Default form data
  const defaultFormData: FormData = {
    date: new Date().toISOString().split('T')[0],
    serialNo: '',
    salesOrderNo: '',
    ticketNo: '',
    invoiceNo: '',
    truckNo: '',
    driverNo: '',
    transporter: '',
    dispatchTo: 'CUSTOMER',
    customerDepotName: '',
    '20L': '',
    '250ML Promo (pc)': '',
    '250ML Promo (box)': '',
    '20L SQ.': '',
    '10L': '',
    '5L': '',
    '3L': '',
    '1L': '',
    'Sunflower 1L': '',
    '250ML': '',
    '500ML': '',
    '500ML Sunflower': '',
    mt: '',
    truckStatus: 'Loaded',
    gatePassNo: ''
  };

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  // Mock notifications
  const notifications = [
    { id: '1', type: 'info', message: 'Dispatch data saved locally', read: false, timestamp: new Date().toISOString() }
  ];

  // Offline caching and online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cached = localStorage.getItem('oilDispatchForm');
    if (cached) {
      setFormData(JSON.parse(cached));
    } else {
      fetchFormData(formData.date, formData.serialNo).then(data => {
        if (data) setFormData(data);
      }).catch(() => {
        // Ignore fetch errors
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [formData.date, formData.serialNo]);

  useEffect(() => {
    localStorage.setItem('oilDispatchForm', JSON.stringify(formData));
  }, [formData]);

  // Auto-calculate MT
  useEffect(() => {
    let totalMT = 0;
    Object.keys(PRODUCT_WEIGHTS).forEach(product => {
      const qty = parseFloat(formData[product as keyof FormData]) || 0;
      totalMT += (qty * PRODUCT_WEIGHTS[product]) / 1000;
    });
    setFormData(prev => ({ ...prev, mt: totalMT.toFixed(2) }));
  }, [
    formData['20L'],
    formData['250ML Promo (pc)'],
    formData['250ML Promo (box)'],
    formData['20L SQ.'],
    formData['10L'],
    formData['5L'],
    formData['3L'],
    formData['1L'],
    formData['Sunflower 1L'],
    formData['250ML'],
    formData['500ML'],
    formData['500ML Sunflower']
  ]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.serialNo) newErrors.serialNo = 'Serial No is required';
    if (!formData.dispatchTo) newErrors.dispatchTo = 'Dispatch To is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'oil_dispatch'
        }),
        mode: 'cors'
      });
      const result: ApiResponse = await response.json();
      if (result.status === 200) {
        alert('Form submitted successfully!');
        setFormData(defaultFormData);
        localStorage.removeItem('oilDispatchForm');
      } else {
        alert(result.message || 'Error submitting form!');
      }
    } catch (error) {
      alert('Error submitting form!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = () => {
    let totalMT = 0;
    Object.keys(PRODUCT_WEIGHTS).forEach(product => {
      const qty = parseFloat(formData[product as keyof FormData]) || 0;
      totalMT += (qty * PRODUCT_WEIGHTS[product]) / 1000;
    });
    setFormData(prev => ({ ...prev, mt: totalMT.toFixed(2) }));
  };

  const handleReset = () => {
    setFormData(defaultFormData);
    setErrors({});
    localStorage.removeItem('oilDispatchForm');
  };

  const fetchFormData = async (date: string, serialNo: string): Promise<FormData | null> => {
    try {
      const response = await fetch(`${BASE_URL}?date=${date}&serialNo=${serialNo}`, {
        method: 'GET',
        mode: 'cors'
      });
      const result: ApiResponse = await response.json();
      if (result.status === 200 && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Notifications Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        <ul>
          {notifications.length === 0 ? null : (
            <li className="p-2 border rounded-md bg-green-50 text-green-900">
              <strong>{notifications[0].type.toUpperCase()}:</strong> {notifications[0].message} {notifications[0].read ? '(Read)' : '(Unread)'} <em className="ml-2 text-xs text-gray-500">({notifications[0].timestamp})</em>
            </li>
          )}
        </ul>
      </div>

      {/* Form Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Oil Dispatch Form</h2>

        <div className="space-y-6">
          {/* General Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]`}
                required
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial No *</label>
              <input
                type="text"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.serialNo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]`}
                placeholder="e.g., S123"
                required
              />
              {errors.serialNo && <p className="text-red-500 text-xs mt-1">{errors.serialNo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order No</label>
              <input
                type="text"
                name="salesOrderNo"
                value={formData.salesOrderNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="e.g., SO456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket No</label>
              <input
                type="text"
                name="ticketNo"
                value={formData.ticketNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="e.g., T789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="e.g., INV101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Truck No</label>
              <input
                type="text"
                name="truckNo"
                value={formData.truckNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="e.g., ABC123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver No</label>
              <input
                type="text"
                name="driverNo"
                value={formData.driverNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="e.g., D456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
              <select
                name="transporter"
                value={formData.transporter}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
              >
                <option value="">Select Transporter</option>
                {TRANSPORTER_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch To *</label>
              <select
                name="dispatchTo"
                value={formData.dispatchTo}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.dispatchTo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]`}
                required
              >
                <option value="">Select Dispatch To</option>
                {DISPATCH_TO_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.dispatchTo && <p className="text-red-500 text-xs mt-1">{errors.dispatchTo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer/Depot Name</label>
              <select
                name="customerDepotName"
                value={formData.customerDepotName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
              >
                <option value="">Select Customer/Depot</option>
                {CUSTOMER_DEPOT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Truck Status</label>
              <select
                name="truckStatus"
                value={formData.truckStatus}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
              >
                {TRUCK_STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gate Pass No</label>
              <input
                type="text"
                name="gatePassNo"
                value={formData.gatePassNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                placeholder="e.g., GP2025"
              />
            </div>
          </div>

          {/* Product Quantities */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">Product Quantities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.keys(PRODUCT_WEIGHTS).map(product => (
                <div key={product}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{product}</label>
                  <input
                    type="number"
                    name={product}
                    value={formData[product as keyof FormData]}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    min="0"
                    placeholder="0"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total MT</label>
                <input
                  type="text"
                  name="mt"
                  value={formData.mt}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleCalculate}
              className="px-4 py-2 bg-white border border-[#2C5B48] text-[#2C5B48] rounded-md hover:bg-[#e6f2ee] focus:outline-none focus:ring-2 focus:ring-[#2C5B48] flex items-center"
            >
              <CalculatorIcon size={18} className="mr-2" />
              Calculate MT
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center"
            >
              <RotateCcwIcon size={18} className="mr-2" />
              Reset Form
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-200 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-[#2C5B48] text-white rounded-md hover:bg-[#224539] focus:outline-none focus:ring-2 focus:ring-[#2C5B48] flex items-center"
            >
              <SaveIcon size={18} className="mr-2" />
              Submit Form
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative animate-slide-up">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl transition"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                ×
              </button>
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
                        <td className="px-4 py-2 text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
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
                  <span className="inline-block animate-pulse">Confirm & Submit</span>
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
              >
                ×
              </button>
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
    </div>
  );
};

export default Oil;