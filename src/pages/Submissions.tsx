import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#a855f7', '#f43f5e', '#eab308', '#14b8a6'];

const BASE_URL = "http://localhost:4000/api";

interface Stock {
  id: number;
  date: string;
  cpo?: any[];
  refinedOil?: any[];
  deodorizerPower?: any[];
  fractionationPower?: any[];
  bleachingEarth?: any[];
  phosphoricAcid?: any[];
  tanks?: any[];
}

interface Chemical {
  id: number;
  date: string;
  feedMT: number;
  bleachingEarth?: any[];
  phosphoricAcid?: any[];
  citricAcid?: any[];
}

export const Submissions: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingChemicals, setLoadingChemicals] = useState(true);
  const [errorStocks, setErrorStocks] = useState<string | null>(null);
  const [errorChemicals, setErrorChemicals] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const fetchStocks = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}?endpoint=stocks`
        );
        if (!response.ok) throw new Error('Failed to fetch stocks');
        const data = await response.json();
        setStocks(data);
      } catch (error: any) {
        setErrorStocks(error.message);
      } finally {
        setLoadingStocks(false);
      }
    };

    const fetchChemicals = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}?endpoint=chemicals`
        );
        if (!response.ok) throw new Error('Failed to fetch chemicals');
        const data = await response.json();
        setChemicals(data);
      } catch (error: any) {
        setErrorChemicals(error.message);
      } finally {
        setLoadingChemicals(false);
      }
    };

    fetchStocks();
    fetchChemicals();
  }, []);

  const sumValues = (arr?: { value?: number; quantity?: number }[]) =>
    arr ? arr.reduce((sum, item) => sum + (item.value ?? item.quantity ?? 0), 0) : 0;

  const stockTrendData = stocks.map(stock => ({
    date: new Date(stock.date).toLocaleDateString(),
    cpo: sumValues(stock.cpo),
    refinedOil: sumValues(stock.refinedOil),
    deodorizerPower: sumValues(stock.deodorizerPower),
    fractionationPower: sumValues(stock.fractionationPower),
    tanks: stock.tanks ? stock.tanks.length : 0,
  }));

  const chemicalPieData = chemicals.length
    ? [
        { name: 'Bleaching Earth', value: chemicals.reduce((sum, c) => sum + sumValues(c.bleachingEarth), 0) },
        { name: 'Phosphoric Acid', value: chemicals.reduce((sum, c) => sum + sumValues(c.phosphoricAcid), 0) },
        { name: 'Citric Acid', value: chemicals.reduce((sum, c) => sum + sumValues(c.citricAcid), 0) }
      ]
    : [];

  // Bar chart data for tanks and refined oil
  const barChartData = stocks.map(stock => ({
    date: new Date(stock.date).toLocaleDateString(),
    tanks: stock.tanks ? stock.tanks.length : 0,
    refinedOil: sumValues(stock.refinedOil),
  }));

  // Simple summary table data (show only a few fields for today)
  const summaryTableData = stocks.map(stock => ({
    date: new Date(stock.date).toLocaleDateString(),
    cpo: sumValues(stock.cpo),
    refinedOil: sumValues(stock.refinedOil),
    deodorizerPower: sumValues(stock.deodorizerPower),
    tanks: stock.tanks ? stock.tanks.length : 0,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Today's Submissions</h1>

      {/* Trend Line Chart */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Refinery Trends</h2>
        {loadingStocks ? (
          <p>Loading stocks...</p>
        ) : errorStocks ? (
          <p className="text-red-600">Error: {errorStocks}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpo" stroke="#2563eb" name="CPO" />
              <Line type="monotone" dataKey="refinedOil" stroke="#22c55e" name="Refined Oil" />
              <Line type="monotone" dataKey="deodorizerPower" stroke="#f59e42" name="Deodorizer Power" />
              <Line type="monotone" dataKey="fractionationPower" stroke="#a855f7" name="Fractionation Power" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Bar Chart */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tanks & Refined Oil (Bar Chart)</h2>
        {loadingStocks ? (
          <p>Loading stocks...</p>
        ) : errorStocks ? (
          <p className="text-red-600">Error: {errorStocks}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tanks" fill="#f59e42" name="Tanks" />
              <Bar dataKey="refinedOil" fill="#22c55e" name="Refined Oil" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Pie Chart */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Chemical Usage Distribution</h2>
        {loadingChemicals ? (
          <p>Loading chemicals...</p>
        ) : errorChemicals ? (
          <p className="text-red-600">Error: {errorChemicals}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chemicalPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chemicalPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Responsive Summary Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Summary Table</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">CPO</th>
                <th className="border px-2 py-1">Refined Oil</th>
                <th className="border px-2 py-1">Deodorizer Power</th>
                <th className="border px-2 py-1">Tanks</th>
              </tr>
            </thead>
            <tbody>
              {summaryTableData.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{row.date}</td>
                  <td className="border px-2 py-1">{row.cpo}</td>
                  <td className="border px-2 py-1">{row.refinedOil}</td>
                  <td className="border px-2 py-1">{row.deodorizerPower}</td>
                  <td className="border px-2 py-1">{row.tanks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
