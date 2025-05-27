import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { SaveIcon } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

const defaultFormData = {
  refineryFeed: '',
  refinedOil: '',
  refinedOilYield: '',
  pfad: '',
  pfadYield: '',
  loss: '',
  lossYield: '',
  bleachingEarth: '',
  bleachingEarthDosage: '',
  phosphoricAcid: '',
  phosphoricAcidDosage: '',
  citricAcid: '',
  citricAcidDosage: '',
  pfadSoap: '',
  stearinSoap: '',
  cpkoSoap: '',
  otherBlendOil: '',
  totalOil: '',
  sodiumSilicate: '',
  causticSoda: '',
  etda: '',
  talc: '',
  sles: '',
  salt: '',
  perfume: '',
  colour: '',
  soapMoisture: '',
  soapProduction: '',
  fractionationFeed: '',
  olein: '',
  oleinYield: '',
  stearin: '',
  stearinYield: ''
};

const BASE_URL = "http://localhost:4000/api";

// (Removed unused toInputDateString function)

export const MTDSummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [fetching, setFetching] = useState(true);

  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${BASE_URL}?endpoint=mtd-summary`);
        if (!res.ok) throw new Error('Failed to fetch MTD summary');
        const data = await res.json();
        setFormData({ ...defaultFormData, ...data });
      } catch (error) {
        addNotification('Could not fetch MTD summary, using defaults.', 'warning');
        setFormData(defaultFormData);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Auto-calculate yields and dosages
  useEffect(() => {
    const feed = parseFloat(formData.refineryFeed) || 0;
    const fractionationFeed = parseFloat(formData.fractionationFeed) || 0;

    setFormData(prev => ({
      ...prev,
      refinedOilYield:
        feed && parseFloat(prev.refinedOil)
          ? ((parseFloat(prev.refinedOil) / feed) * 100).toFixed(2)
          : '',
      pfadYield:
        feed && parseFloat(prev.pfad)
          ? ((parseFloat(prev.pfad) / feed) * 100).toFixed(2)
          : '',
      lossYield:
        feed && parseFloat(prev.loss)
          ? ((parseFloat(prev.loss) / feed) * 100).toFixed(2)
          : '',
      bleachingEarthDosage:
        feed && parseFloat(prev.bleachingEarth)
          ? ((parseFloat(prev.bleachingEarth) / feed) * 100).toFixed(2)
          : '',
      phosphoricAcidDosage:
        feed && parseFloat(prev.phosphoricAcid)
          ? ((parseFloat(prev.phosphoricAcid) / feed) * 100).toFixed(2)
          : '',
      citricAcidDosage:
        feed && parseFloat(prev.citricAcid)
          ? ((parseFloat(prev.citricAcid) / feed) * 100).toFixed(2)
          : '',
      oleinYield:
        fractionationFeed && parseFloat(prev.olein)
          ? ((parseFloat(prev.olein) / fractionationFeed) * 100).toFixed(2)
          : '',
      stearinYield:
        fractionationFeed && parseFloat(prev.stearin)
          ? ((parseFloat(prev.stearin) / fractionationFeed) * 100).toFixed(2)
          : ''
    }));
    // Only recalculate when relevant fields change
    // eslint-disable-next-line
  }, [
    formData.refineryFeed,
    formData.refinedOil,
    formData.pfad,
    formData.loss,
    formData.bleachingEarth,
    formData.phosphoricAcid,
    formData.citricAcid,
    formData.fractionationFeed,
    formData.olein,
    formData.stearin
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(
        BASE_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            type: 'mtd-summary'
          })
        }
      );
      const result = await res.json();
      if (result.status === 200) {
        addNotification('MTD Summary submitted successfully!', 'success');
        setFormData(defaultFormData); // Reset form on success
      } else {
        addNotification(result.message || 'Error submitting MTD Summary!', 'error');
      }
    } catch (error) {
      addNotification('Error submitting MTD Summary!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Month-To-Date Summary">
        {fetching ? (
          <div>Loading summary...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Refinery MTD */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#2C5B48]">Refinery - MTD</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  Yield % Formula: <code>(Output / Feed) × 100</code>
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#f5f8f7]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Particulars
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Qty (MT)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Yield %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4 font-medium">Feed</td>
                      <td>
                        <input type="text" name="refineryFeed" value={formData.refineryFeed} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td className="text-center text-gray-400">-</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Refined Oil</td>
                      <td>
                        <input type="text" name="refinedOil" value={formData.refinedOil} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="refinedOilYield" value={formData.refinedOilYield}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(Refined Oil / Feed) × 100" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">PFAD</td>
                      <td>
                        <input type="text" name="pfad" value={formData.pfad} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="pfadYield" value={formData.pfadYield}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(PFAD / Feed) × 100" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Loss</td>
                      <td>
                        <input type="text" name="loss" value={formData.loss} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="lossYield" value={formData.lossYield}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(Loss / Feed) × 100" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Additives MTD */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#2C5B48]">Additives - MTD</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  Dosage % Formula: <code>(Quantity (kg) / Feed (MT)) × 100</code>
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#f5f8f7]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Particulars
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Qty (kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        % Dosage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4 font-medium">Bleaching Earth</td>
                      <td>
                        <input type="text" name="bleachingEarth" value={formData.bleachingEarth} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="bleachingEarthDosage" value={formData.bleachingEarthDosage}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(Qty / Feed) × 100" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Phosphoric Acid</td>
                      <td>
                        <input type="text" name="phosphoricAcid" value={formData.phosphoricAcid} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="phosphoricAcidDosage" value={formData.phosphoricAcidDosage}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(Qty / Feed) × 100" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Citric Acid</td>
                      <td>
                        <input type="text" name="citricAcid" value={formData.citricAcid} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="citricAcidDosage" value={formData.citricAcidDosage}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(Qty / Feed) × 100" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Fractionation MTD */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#2C5B48]">Fractionation - MTD</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  Yield % Formula: <code>(Output / Feed) × 100</code>
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#f5f8f7]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Particulars
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Qty (MT)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#2C5B48] uppercase tracking-wider">
                        Yield %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4 font-medium">Feed</td>
                      <td>
                        <input type="text" name="fractionationFeed" value={formData.fractionationFeed} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td className="text-center text-gray-400">-</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Olein</td>
                      <td>
                        <input type="text" name="olein" value={formData.olein} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="oleinYield" value={formData.oleinYield}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(Olein / Feed) × 100" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Stearin</td>
                      <td>
                        <input type="text" name="stearin" value={formData.stearin} onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
                      </td>
                      <td>
                        <input type="text" name="stearinYield" value={formData.stearinYield}
                          readOnly
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                          placeholder="(Stearin / Feed) × 100" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end pt-4">
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
                {isLoading ? 'Submitting...' : 'Submit MTD Summary'}
              </button>
            </div>
          </form>
        )}
      </Card>
      <Card title="Refinery MTD Outputs">
        {formData.refinedOil || formData.pfad || formData.loss ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                {
                  name: 'Refinery MTD',
                  refinedOil: parseFloat(formData.refinedOil) || 0,
                  pfad: parseFloat(formData.pfad) || 0,
                  loss: parseFloat(formData.loss) || 0,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} MT`} />
              <Legend />
              <Bar dataKey="refinedOil" stackId="a" fill="#2C5B48" name="Refined Oil (MT)" />
              <Bar dataKey="pfad" stackId="a" fill="#22c55e" name="PFAD (MT)" />
              <Bar dataKey="loss" stackId="a" fill="#f59e42" name="Loss (MT)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-400 py-4">No data available.</div>
        )}
      </Card>
    </div>
  );
};