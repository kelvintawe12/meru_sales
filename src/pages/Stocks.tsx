import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { SaveIcon, RotateCcwIcon } from 'lucide-react';
import { calculateStockFromDip, formatNumber } from '../utils/calculations';
import { useNotifications } from '../hooks/useNotifications';

interface ReadingCalculation {
  current: string;
  previous: string;
  difference: string;
}
interface ChemicalStock {
  bags: string;
  weightPerUnit: string;
  total: string;
}
interface Tank {
  tankNo: string;
  oilType: string;
  tankHeight: number;
  calibration: number;
  maxStorageCapacity: number;
  dipCm: string;
  stock: number;
  particulars: string;
  qtyMT: number;
}

interface FormData {
  date: string;
  cpo: ReadingCalculation;
  refinedOil: ReadingCalculation;
  deodorizerPower: ReadingCalculation;
  fractionationPower: ReadingCalculation;
  bleachingEarth: ChemicalStock;
  phosphoricAcid: ChemicalStock;
  [key: string]: any;
}

const defaultFormData: FormData = {
  date: new Date().toISOString().split('T')[0],
  cpo: { current: '', previous: '', difference: '' },
  refinedOil: { current: '', previous: '', difference: '' },
  deodorizerPower: { current: '', previous: '', difference: '' },
  fractionationPower: { current: '', previous: '', difference: '' },
  bleachingEarth: { bags: '', weightPerUnit: '25', total: '' },
  phosphoricAcid: { bags: '', weightPerUnit: '35', total: '' }
};

const defaultTanks: Tank[] = [
  { tankNo: '1', oilType: 'CPOL', tankHeight: 10.00, calibration: 71.00, maxStorageCapacity: 710, dipCm: '', stock: 0, particulars: 'CPOL', qtyMT: 0 },
  { tankNo: '2', oilType: 'SUPER OLEIN', tankHeight: 10.00, calibration: 71.00, maxStorageCapacity: 710, dipCm: '', stock: 0, particulars: 'Refined Oil', qtyMT: 0 },
  { tankNo: '3', oilType: 'CPOL', tankHeight: 10.00, calibration: 71.00, maxStorageCapacity: 710, dipCm: '', stock: 0, particulars: 'PFAD', qtyMT: 0 },
  { tankNo: '4', oilType: 'REFINED OIL', tankHeight: 10.00, calibration: 71.00, maxStorageCapacity: 710, dipCm: '', stock: 0, particulars: 'Olein', qtyMT: 0 },
  { tankNo: '5', oilType: 'CRUDE SBO', tankHeight: 6.25, calibration: 17.60, maxStorageCapacity: 176, dipCm: '', stock: 0, particulars: 'Super Olein', qtyMT: 0 },
  { tankNo: '6', oilType: 'CRUDE SFO', tankHeight: 10.08, calibration: 26.00, maxStorageCapacity: 262, dipCm: '', stock: 0, particulars: 'Stearin', qtyMT: 0 },
  { tankNo: '7', oilType: 'CRUDE SFO/SBO', tankHeight: 10.08, calibration: 26.00, maxStorageCapacity: 262, dipCm: '', stock: 0, particulars: 'CSB Oil', qtyMT: 0 },
  { tankNo: '8', oilType: 'REFINED SBO', tankHeight: 10.80, calibration: 21.75, maxStorageCapacity: 235, dipCm: '', stock: 0, particulars: 'SB Refined Oil', qtyMT: 0 },
  { tankNo: '9', oilType: 'REFINED SFO', tankHeight: 10.80, calibration: 21.75, maxStorageCapacity: 235, dipCm: '', stock: 0, particulars: 'CSFO', qtyMT: 0 },
  { tankNo: 'NR-1', oilType: 'REFINED OIL', tankHeight: 6.20, calibration: 23.11, maxStorageCapacity: 143, dipCm: '', stock: 0, particulars: 'SF Refined Oil', qtyMT: 0 },
  { tankNo: 'NR-2', oilType: 'PALM STEARIN', tankHeight: 4.70, calibration: 23.11, maxStorageCapacity: 109, dipCm: '', stock: 0, particulars: 'Grand Total', qtyMT: 0 }
];

const BASE_URL = "http://localhost:4000/api";

export const Stocks: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [tanks, setTanks] = useState<Tank[]>(defaultTanks);
  const [showFormula, setShowFormula] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notifications hook
  const { notifications, loading: notificationsLoading, addNotification } = useNotifications();

  const handleDipChange = (index: number, value: string) => {
    setTanks(prev => {
      const newTanks = [...prev];
      newTanks[index].dipCm = value;
      const dipNum = parseFloat(value);
      if (!isNaN(dipNum)) {
        newTanks[index].stock = calculateStockFromDip(dipNum, newTanks[index].calibration);
        newTanks[index].qtyMT = parseFloat((newTanks[index].stock / 1000).toFixed(2));
      } else {
        newTanks[index].stock = 0;
        newTanks[index].qtyMT = 0;
      }
      return newTanks;
    });
  };

  const grandTotalQty = tanks.reduce((sum, tank) => sum + (tank.qtyMT || 0), 0);

  const calculateDifference = (current: string, previous: string): string => {
    const curr = parseFloat(current) || 0;
    const prev = parseFloat(previous) || 0;
    return (curr - prev).toFixed(2);
  };

  const calculateChemicalTotal = (bags: string, weightPerUnit: string): string => {
    const quantity = parseFloat(bags) || 0;
    const weight = parseFloat(weightPerUnit) || 0;
    return (quantity * weight).toFixed(2);
  };

  const handleReadingChange = (
    type: keyof Omit<FormData, 'date' | 'bleachingEarth' | 'phosphoricAcid'>,
    field: keyof ReadingCalculation,
    value: string
  ) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [type]: {
          ...prev[type] as ReadingCalculation,
          [field]: value
        }
      };
      if (type === 'cpo' || type === 'refinedOil' || type === 'deodorizerPower' || type === 'fractionationPower') {
        newData[type].difference = calculateDifference(newData[type].current, newData[type].previous);
      }
      return newData;
    });
  };

  const handleChemicalChange = (
    type: 'bleachingEarth' | 'phosphoricAcid',
    field: keyof ChemicalStock,
    value: string
  ) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value
        }
      };
      newData[type].total = calculateChemicalTotal(newData[type].bags, newData[type].weightPerUnit);
      return newData;
    });
  };

  // Reset form handler
  const handleResetForm = () => {
    setFormData({
      ...defaultFormData,
      date: new Date().toISOString().split('T')[0]
    });
    setTanks(defaultTanks);
    localStorage.removeItem('stocksForm');
    localStorage.removeItem('stocksTanks');
    setShowResetConfirm(false);
  };

  // Update handleSubmit to only open preview
  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  // Confirm and actually submit
  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      const response = await fetch(
        BASE_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.date,
            cpo: { value: formData.cpo.current },
            refinedoil: { value: formData.refinedOil.current },
            deodorizerPower: { value: formData.deodorizerPower.current },
            fractionationPower: { value: formData.fractionationPower.current },
            bleachingEarth: { value: formData.bleachingEarth.total },
            phosphoricAcid: { value: formData.phosphoricAcid.total },
            tanks,
            type: 'tanks'
          })
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        addNotification('Stock data submitted successfully!', 'success');
        setFormData({
          ...defaultFormData,
          date: new Date().toISOString().split('T')[0]
        });
        setTanks(defaultTanks);
        setShowPreview(false);
      } else {
        addNotification(result.message || 'Error submitting stock data', 'error');
      }
    } catch (error) {
      console.error('Error submitting stock data:', error);
      addNotification('Error submitting stock data', 'error');
    } finally {
      setIsLoading(false);
    }
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

      {/* Formula & Learn More */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-700">
          <strong>Formulas Overview:</strong>
          <ul className="list-disc ml-5 mt-1">
            <li>
              <b>Tank Stock (kg):</b> <code>Dip (cm) × Calibration (kg/cm)</code>
            </li>
            <li>
              <b>Qty (MT):</b> <code>Stock (kg) / 1000</code>
            </li>
            <li>
              <b>Meter Difference:</b> <code>Current - Previous</code>
            </li>
            <li>
              <b>Chemical Total (kg):</b> <code>Bags × Weight per Bag (kg)</code>
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

      {/* Notifications Section */}
      <Card title="Notifications">
        {notificationsLoading ? (
          <div>Loading notifications...</div>
        ) : (
          <ul>
            {notifications.length === 0 || !notifications[0] ? null : (
              <li key={notifications[0]?.id} className="p-2 border rounded-md bg-green-50 text-green-900">
                <strong>{notifications[0]?.type ? notifications[0].type.toUpperCase() : 'NOTICE'}:</strong>
                {' '}
                {notifications[0]?.message ?? ''}
                {' '}
                {notifications[0]?.read ? '(Read)' : '(Unread)'}
                <em className="ml-2 text-xs text-gray-500">
                  ({notifications[0]?.timestamp ?? ''})
                </em>
              </li>
            )}
          </ul>
        )}
      </Card>
      {/* Stock Management Form */}
      <Card title="Stock Management">
        <form onSubmit={handlePreviewSubmit} className="space-y-6">
          {/* Tanks Stocks Table Section */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Tanks Stocks
              </h3>
              <span className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600">
                Formula: <code>Stock (kg) = Dip (cm) × Calibration (kg/cm)</code>, <code>Qty (MT) = Stock (kg) / 1000</code>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left text-sm">Tank No</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-sm">Oil Type</th>
                    <th className="border border-gray-300 px-2 py-1 text-right text-sm">Tank Height (m)</th>
                    <th className="border border-gray-300 px-2 py-1 text-right text-sm">Calibration (kg/cm)</th>
                    <th className="border border-gray-300 px-2 py-1 text-right text-sm">Max Storage Capacity (MT)</th>
                    <th className="border border-gray-300 px-2 py-1 text-right text-sm">Dip in cm</th>
                    <th className="border border-gray-300 px-2 py-1 text-right text-sm">Stock(KG)</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-sm">Particulars</th>
                    <th className="border border-gray-300 px-2 py-1 text-right text-sm">Qty (MT)</th>
                  </tr>
                </thead>
                <tbody>
                  {tanks.map((tank, index) => (
                    <tr key={tank.tankNo} className="border-t border-gray-300">
                      <td className="border border-gray-300 px-2 py-1 text-left text-sm">{tank.tankNo}</td>
                      <td className="border border-gray-300 px-2 py-1 text-left text-sm">{tank.oilType}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right text-sm">{tank.tankHeight.toFixed(2)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right text-sm">{tank.calibration.toFixed(2)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right text-sm">{tank.maxStorageCapacity.toFixed(0)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right text-sm">
                        <input
                          type="number"
                          value={tank.dipCm}
                          onChange={e => handleDipChange(index, e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded-md text-right text-sm"
                          step="0.01"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right text-sm">{formatNumber(tank.stock)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-left text-sm">{tank.particulars}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right text-sm">{tank.qtyMT.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-300 font-semibold bg-gray-100">
                    <td colSpan={8} className="border border-gray-300 px-2 py-1 text-right text-sm">Grand Total</td>
                    <td className="border border-gray-300 px-2 py-1 text-right text-sm">{grandTotalQty.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Meter Readings Section */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Meter Readings
              </h3>
              <span className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600">
                Formula: <code>Difference = Current - Previous</code>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {([
                {
                  id: 'cpo',
                  label: 'CPO (Crude Oil)'
                },
                {
                  id: 'refinedOil',
                  label: 'Refined Deodorised Oil'
                },
                {
                  id: 'deodorizerPower',
                  label: 'Deodorizer Power'
                },
                {
                  id: 'fractionationPower',
                  label: 'Fractionation Power'
                }
              ] as { id: keyof Pick<FormData, 'cpo' | 'refinedOil' | 'deodorizerPower' | 'fractionationPower'>; label: string }[]).map(item => (
                <div key={item.id} className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-3">{item.label}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Current Reading
                      </label>
                      <input
                        type="number"
                        value={formData[item.id].current}
                        onChange={e => handleReadingChange(item.id, 'current', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Previous Reading
                      </label>
                      <input
                        type="number"
                        value={formData[item.id].previous}
                        onChange={e => handleReadingChange(item.id, 'previous', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Difference
                      </label>
                      <input
                        type="text"
                        value={formData[item.id].difference}
                        readOnly
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Chemical Stocks Section */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Chemical Stocks
              </h3>
              <span className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600">
                Formula: <code>Total (kg) = Bags × Weight per Bag (kg)</code>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{
                id: 'bleachingEarth',
                label: 'Bleaching Earth',
                unit: 'bags'
              }, {
                id: 'phosphoricAcid',
                label: 'Phosphoric Acid',
                unit: 'gallons'
              }].map(item => (
                <div key={item.id} className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-3">{item.label}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Number of {item.unit}
                      </label>
                      <input
                        type="number"
                        value={formData[item.id].bags}
                        onChange={e => handleChemicalChange(item.id as 'bleachingEarth' | 'phosphoricAcid', 'bags', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Weight per {item.unit} (kg)
                      </label>
                      <input
                        type="number"
                        value={formData[item.id].weightPerUnit}
                        onChange={e => handleChemicalChange(item.id as 'bleachingEarth' | 'phosphoricAcid', 'weightPerUnit', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Total Weight (kg)
                      </label>
                      <input
                        type="text"
                        value={formData[item.id].total}
                        readOnly
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
              className={`inline-flex items-center px-6 py-2 rounded-md font-semibold shadow-sm transition-colors
                ${isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2C5B48] text-white hover:bg-[#224539]'
                } focus:outline-none focus:ring-2 focus:ring-[#2C5B48]`}
            >
              <SaveIcon size={18} className="mr-2" />
              {isLoading ? 'Submitting...' : 'Submit Stock Data'}
            </button>
          </div>
        </form>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative animate-slide-up">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl transition"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >&times;</button>
              <h4 className="text-xl font-bold mb-4 text-[#2C5B48]">Preview Submission</h4>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full border border-gray-200 rounded-lg mb-4">
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
                    {(['cpo', 'refinedOil', 'deodorizerPower', 'fractionationPower'] as const).map(key => (
                      <React.Fragment key={key}>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">{key.toUpperCase()} Current</td>
                          <td className="px-4 py-2 text-gray-900">{formData[key].current}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">{key.toUpperCase()} Previous</td>
                          <td className="px-4 py-2 text-gray-900">{formData[key].previous}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">{key.toUpperCase()} Difference</td>
                          <td className="px-4 py-2 text-gray-900">{formData[key].difference}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                    {(['bleachingEarth', 'phosphoricAcid'] as const).map(key => (
                      <React.Fragment key={key}>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">{key.replace(/([A-Z])/g, ' $1')} Bags</td>
                          <td className="px-4 py-2 text-gray-900">{formData[key].bags}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">{key.replace(/([A-Z])/g, ' $1')} Weight/Unit</td>
                          <td className="px-4 py-2 text-gray-900">{formData[key].weightPerUnit}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">{key.replace(/([A-Z])/g, ' $1')} Total</td>
                          <td className="px-4 py-2 text-gray-900">{formData[key].total}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                <h5 className="font-semibold text-[#2C5B48] mb-2">Tanks</h5>
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Tank No</th>
                      <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Oil Type</th>
                      <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">Dip (cm)</th>
                      <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">Stock (kg)</th>
                      <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">Qty (MT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tanks.map(tank => (
                      <tr key={tank.tankNo}>
                        <td className="px-2 py-1 text-gray-600">{tank.tankNo}</td>
                        <td className="px-2 py-1 text-gray-600">{tank.oilType}</td>
                        <td className="px-2 py-1 text-gray-900 text-right">{tank.dipCm}</td>
                        <td className="px-2 py-1 text-gray-900 text-right">{formatNumber(tank.stock)}</td>
                        <td className="px-2 py-1 text-gray-900 text-right">{tank.qtyMT.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => setShowPreview(false)}
                >
                  Continue Editing
                </button>
                <button
                  className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#2C5B48] to-[#22c55e] text-white shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C5B48]"
                  onClick={() => {
                    setShowPreview(false);
                    setShowConfirm(true);
                  }}
                >
                  Confirm &amp; Submit
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
                    onClick={handleConfirmSubmit}
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

        {/* Popup for calculation explanations */}
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
              <h4 className="text-lg font-semibold mb-2 text-[#2C5B48]">Stock Calculations Explained</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                <li>
                  <strong>Tank Stock (kg):</strong> The stock in each tank is calculated by multiplying the dip (height of oil in cm) by the tank's calibration factor (kg/cm). This gives the total weight of oil in the tank.
                </li>
                <li>
                  <strong>Qty (MT):</strong> The stock in kilograms is divided by 1000 to convert it to metric tons (MT).
                </li>
                <li>
                  <strong>Meter Difference:</strong> For each meter, the difference is the current reading minus the previous reading, showing the usage or production for the period.
                </li>
                <li>
                  <strong>Chemical Total (kg):</strong> The total chemical stock is calculated by multiplying the number of bags by the weight per bag (in kg).
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                These formulas ensure accurate and consistent tracking of stocks and consumables in the refinery.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
