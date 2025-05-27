import React, { useState, useEffect } from 'react';
import { SaveIcon, CalculatorIcon, RotateCcwIcon } from 'lucide-react';

// Product weights for SOAP (in kg per unit)
const SOAP_WEIGHTS: { [key: string]: number } = {
  '10X1Kg WHITE': 10,
  '20X1Kg WHITE': 20,
  '10x1kg W POWER STAR': 10,
  '10x1kg W Promotion': 10,
  '5x1Kg WHITE': 5,
  '5x1kg W Promotion': 5,
  '600GM WHITE': 0.6,
  '500GM WHITE': 0.5,
  '1KG BLUE': 1,
  '5x1KG BLUE': 5,
  '600GM BLUE': 0.6,
  '800 GM BLUE': 0.8,
  '500GM BLUE': 0.5
};

// Dropdown options (derived from DOC data and context)
const DISPATCH_TO_OPTIONS = ['CUSTOMER', 'DEPOT', 'EXPORT'];
const TRUCK_STATUS_OPTIONS = ['GATE PASS ISSUED', 'Loaded', 'In Transit', 'Delivered', 'Returned'];
const TRANSPORTER_OPTIONS = ['SELF TRUCK', 'MOUNT MERU', 'Other'];
const CUSTOMER_DEPOT_OPTIONS = ['LFL', 'FINE FISH', 'Depot A', 'Depot B'];

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzuyhsb1VsdCEPyqOTXjHSU9bE6-yv6sfLtHGN8Jda6YLP1YpdyeOk6Wheyi6OGa3yt4Q/exec';

interface DocFormData {
  date: string;
  truckNo: string;
  ticketNo: string;
  salesOrderNo: string;
  invoiceNo: string;
  transporter: string;
  driverNo: string;
  dispatchTo: string;
  customerDepotName: string;
  soyaDocMT: string;
  sunflowerDocMT: string;
  totalMT: string;
  truckStatus: string;
}

interface SoapFormData {
  date: string;
  serialNo: string;
  ebm: string;
  ticketNo: string;
  salesOrderNo: string;
  truckNo: string;
  driverNo: string;
  transporter: string;
  dispatchTo: string;
  customerDepotName: string;
  '10X1Kg WHITE': string;
  '20X1Kg WHITE': string;
  '10x1kg W POWER STAR': string;
  '10x1kg W Promotion': string;
  '5x1Kg WHITE': string;
  '5x1kg W Promotion': string;
  '600GM WHITE': string;
  '500GM WHITE': string;
  '1KG BLUE': string;
  '5x1KG BLUE': string;
  '600GM BLUE': string;
  '800 GM BLUE': string;
  '500GM BLUE': string;
  mt: string;
  truckStatus: string;
  gatePassNo: string;
}

interface ApiResponse {
  status: number;
  message?: string;
  data?: DocFormData | SoapFormData;
}

const OilDispatchForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'doc' | 'soap'>('doc');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Default form data
  const defaultDocFormData: DocFormData = {
    date: new Date().toISOString().split('T')[0],
    truckNo: '',
    ticketNo: '',
    salesOrderNo: '',
    invoiceNo: '',
    transporter: '',
    driverNo: '',
    dispatchTo: 'CUSTOMER',
    customerDepotName: '',
    soyaDocMT: '',
    sunflowerDocMT: '',
    totalMT: '',
    truckStatus: 'GATE PASS ISSUED'
  };

  const defaultSoapFormData: SoapFormData = {
    date: new Date().toISOString().split('T')[0],
    serialNo: '',
    ebm: '',
    ticketNo: '',
    salesOrderNo: '',
    truckNo: '',
    driverNo: '',
    transporter: '',
    dispatchTo: 'CUSTOMER',
    customerDepotName: '',
    '10X1Kg WHITE': '',
    '20X1Kg WHITE': '',
    '10x1kg W POWER STAR': '',
    '10x1kg W Promotion': '',
    '5x1Kg WHITE': '',
    '5x1kg W Promotion': '',
    '600GM WHITE': '',
    '500GM WHITE': '',
    '1KG BLUE': '',
    '5x1KG BLUE': '',
    '600GM BLUE': '',
    '800 GM BLUE': '',
    '500GM BLUE': '',
    mt: '',
    truckStatus: 'GATE PASS ISSUED',
    gatePassNo: ''
  };

  const [docFormData, setDocFormData] = useState<DocFormData>(defaultDocFormData);
  const [soapFormData, setSoapFormData] = useState<SoapFormData>(defaultSoapFormData);

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

    const cachedDoc = localStorage.getItem('docDispatchForm');
    const cachedSoap = localStorage.getItem('soapDispatchForm');
    if (cachedDoc) setDocFormData(JSON.parse(cachedDoc));
    if (cachedSoap) setSoapFormData(JSON.parse(cachedSoap));

    if (!cachedDoc && activeTab === 'doc') {
      fetchFormData(docFormData.date, docFormData.ticketNo, 'doc').then(data => {
        if (data) setDocFormData(data as DocFormData);
      });
    }
    if (!cachedSoap && activeTab === 'soap') {
      fetchFormData(soapFormData.date, soapFormData.serialNo, 'soap').then(data => {
        if (data) setSoapFormData(data as SoapFormData);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [docFormData.date, docFormData.ticketNo, soapFormData.date, soapFormData.serialNo, activeTab]);

  useEffect(() => {
    localStorage.setItem('docDispatchForm', JSON.stringify(docFormData));
  }, [docFormData]);

  useEffect(() => {
    localStorage.setItem('soapDispatchForm', JSON.stringify(soapFormData));
  }, [soapFormData]);

  // Auto-calculate TOTAL MT for DOC
  useEffect(() => {
    const soyaMT = parseFloat(docFormData.soyaDocMT) || 0;
    const sunflowerMT = parseFloat(docFormData.sunflowerDocMT) || 0;
    const totalMT = (soyaMT + sunflowerMT).toFixed(2);
    setDocFormData(prev => ({ ...prev, totalMT }));
  }, [docFormData.soyaDocMT, docFormData.sunflowerDocMT]);

  // Auto-calculate MT for SOAP
  useEffect(() => {
    let totalMT = 0;
    Object.keys(SOAP_WEIGHTS).forEach(product => {
      const qty = parseFloat(soapFormData[product as keyof SoapFormData]) || 0;
      totalMT += (qty * SOAP_WEIGHTS[product]) / 1000;
    });
    setSoapFormData(prev => ({ ...prev, mt: totalMT.toFixed(2) }));
  }, [
    soapFormData['10X1Kg WHITE'],
    soapFormData['20X1Kg WHITE'],
    soapFormData['10x1kg W POWER STAR'],
    soapFormData['10x1kg W Promotion'],
    soapFormData['5x1Kg WHITE'],
    soapFormData['5x1kg W Promotion'],
    soapFormData['600GM WHITE'],
    soapFormData['500GM WHITE'],
    soapFormData['1KG BLUE'],
    soapFormData['5x1KG BLUE'],
    soapFormData['600GM BLUE'],
    soapFormData['800 GM BLUE'],
    soapFormData['500GM BLUE']
  ]);

  const validateForm = (form: DocFormData | SoapFormData, type: 'doc' | 'soap'): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = 'Date is required';
    if (type === 'soap' && !(form as SoapFormData).serialNo) newErrors.serialNo = 'Serial No is required';
    if (!form.dispatchTo) newErrors.dispatchTo = 'Dispatch To is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDocFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSoapChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSoapFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = () => {
    const form = activeTab === 'doc' ? docFormData : soapFormData;
    if (validateForm(form, activeTab)) {
      setShowPreview(true);
    }
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      const form = activeTab === 'doc' ? docFormData : soapFormData;
      const type = activeTab === 'doc' ? 'doc_dispatch' : 'soap_dispatch';
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type }),
        mode: 'cors'
      });
      const result: ApiResponse = await response.json();
      if (result.status === 200) {
        alert('Form submitted successfully!');
        if (activeTab === 'doc') {
          setDocFormData(defaultDocFormData);
          localStorage.removeItem('docDispatchForm');
        } else {
          setSoapFormData(defaultSoapFormData);
          localStorage.removeItem('soapDispatchForm');
        }
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
    if (activeTab === 'doc') {
      const soyaMT = parseFloat(docFormData.soyaDocMT) || 0;
      const sunflowerMT = parseFloat(docFormData.sunflowerDocMT) || 0;
      setDocFormData(prev => ({ ...prev, totalMT: (soyaMT + sunflowerMT).toFixed(2) }));
    } else {
      let totalMT = 0;
      Object.keys(SOAP_WEIGHTS).forEach(product => {
        const qty = parseFloat(soapFormData[product as keyof SoapFormData]) || 0;
        totalMT += (qty * SOAP_WEIGHTS[product]) / 1000;
      });
      setSoapFormData(prev => ({ ...prev, mt: totalMT.toFixed(2) }));
    }
  };

  const handleReset = () => {
    if (activeTab === 'doc') {
      setDocFormData(defaultDocFormData);
      localStorage.removeItem('docDispatchForm');
    } else {
      setSoapFormData(defaultSoapFormData);
      localStorage.removeItem('soapDispatchForm');
    }
    setErrors({});
  };

  const fetchFormData = async (date: string, identifier: string, type: 'doc' | 'soap'): Promise<DocFormData | SoapFormData | null> => {
    try {
      const query = type === 'doc' ? `ticketNo=${identifier}` : `serialNo=${identifier}`;
      const response = await fetch(`${BASE_URL}?date=${date}&${query}&type=${type}_dispatch`, {
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

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('doc')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'doc' ? 'border-b-2 border-[#2C5B48] text-[#2C5B48]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              DOC Dispatch
            </button>
            <button
              onClick={() => setActiveTab('soap')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'soap' ? 'border-b-2 border-[#2C5B48] text-[#2C5B48]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              SOAP Dispatch
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {activeTab === 'doc' ? (
            <>
              {/* DOC General Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={docFormData.date}
                    onChange={handleDocChange}
                    className={`w-full p-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]`}
                    required
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Truck No</label>
                  <input
                    type="text"
                    name="truckNo"
                    value={docFormData.truckNo}
                    onChange={handleDocChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., RAE 074 N"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket No</label>
                  <input
                    type="text"
                    name="ticketNo"
                    value={docFormData.ticketNo}
                    onChange={handleDocChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., 27906"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order No</label>
                  <input
                    type="text"
                    name="salesOrderNo"
                    value={docFormData.salesOrderNo}
                    onChange={handleDocChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., 1847"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                  <input
                    type="text"
                    name="invoiceNo"
                    value={docFormData.invoiceNo}
                    onChange={handleDocChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., 42119"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
                  <select
                    name="transporter"
                    value={docFormData.transporter}
                    onChange={handleDocChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                  >
                    <option value="">Select Transporter</option>
                    {TRANSPORTER_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver No</label>
                  <input
                    type="text"
                    name="driverNo"
                    value={docFormData.driverNo}
                    onChange={handleDocChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., 72365763"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch To *</label>
                  <select
                    name="dispatchTo"
                    value={docFormData.dispatchTo}
                    onChange={handleDocChange}
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
                    value={docFormData.customerDepotName}
                    onChange={handleDocChange}
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
                    value={docFormData.truckStatus}
                    onChange={handleDocChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                  >
                    {TRUCK_STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DOC Quantities */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-md font-medium text-gray-800 mb-4">DOC Quantities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soya DOC (MT)</label>
                    <input
                      type="number"
                      name="soyaDocMT"
                      value={docFormData.soyaDocMT}
                      onChange={handleDocChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sunflower DOC (MT)</label>
                    <input
                      type="number"
                      name="sunflowerDocMT"
                      value={docFormData.sunflowerDocMT}
                      onChange={handleDocChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total MT</label>
                    <input
                      type="text"
                      name="totalMT"
                      value={docFormData.totalMT}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* SOAP General Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={soapFormData.date}
                    onChange={handleSoapChange}
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
                    value={soapFormData.serialNo}
                    onChange={handleSoapChange}
                    className={`w-full p-2 border ${errors.serialNo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]`}
                    placeholder="e.g., S123"
                    required
                  />
                  {errors.serialNo && <p className="text-red-500 text-xs mt-1">{errors.serialNo}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EBM</label>
                  <input
                    type="text"
                    name="ebm"
                    value={soapFormData.ebm}
                    onChange={handleSoapChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., EBM456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket No</label>
                  <input
                    type="text"
                    name="ticketNo"
                    value={soapFormData.ticketNo}
                    onChange={handleSoapChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., 27906"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order No</label>
                  <input
                    type="text"
                    name="salesOrderNo"
                    value={soapFormData.salesOrderNo}
                    onChange={handleSoapChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                    placeholder="e.g., 1847"
                  />
                </div>
                <div>
                  <label className