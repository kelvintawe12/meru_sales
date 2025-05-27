import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

interface Stock {
  id: number;
  date: string;
  cpo?: { value: number }[];
  refinedOil?: { value: number }[];
  deodorizerPower?: { value: number }[];
  fractionationPower?: { value: number }[];
  tanks?: any[];
}

interface Chemical {
  id: number;
  date: string;
  feedMT: number;
  bleachingEarth?: { quantity: number }[];
  phosphoricAcid?: { quantity: number }[];
  citricAcid?: { quantity: number }[];
}

type Timeframe = 'daily' | 'weekly' | 'monthly';

const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#a855f7', '#f43f5e', '#eab308', '#14b8a6'];

const formatDate = (date: Date) => date.toLocaleDateString();
const getWeek = (date: Date) => {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    d.getFullYear() +
    '-W' +
    String(
      1 +
        Math.round(
          ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        )
    ).padStart(2, '0')
  );
};
const getMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const sumValues = (arr?: { value?: number; quantity?: number }[]): number =>
  arr?.reduce((sum, item) => sum + (item.value ?? item.quantity ?? 0), 0) ?? 0;

const groupByTimeframe = <T extends { date: string }>(
  arr: T[],
  tf: Timeframe
): Record<string, T[]> => {
  return arr.reduce((acc, item) => {
    const dateObj = new Date(item.date);
    if (isNaN(dateObj.getTime())) return acc;
    const key =
      tf === 'daily' ? formatDate(dateObj) : tf === 'weekly' ? getWeek(dateObj) : getMonth(dateObj);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

function downloadCSV(rows: string[][], filename: string) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const BASE_URL = "http://localhost:4000/api";

const Reports: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingChemicals, setLoadingChemicals] = useState(true);
  const [errorStocks, setErrorStocks] = useState<string | null>(null);
  const [errorChemicals, setErrorChemicals] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [minCPO, setMinCPO] = useState('');
  const [maxCPO, setMaxCPO] = useState('');
  const [minRefinedOil, setMinRefinedOil] = useState('');
  const [maxRefinedOil, setMaxRefinedOil] = useState('');
  const [tankFilter, setTankFilter] = useState<string[]>([]);

  useEffect(() => {
    const fetchStocks = async () => {
      setLoadingStocks(true);
      try {
        const response = await fetch(`${BASE_URL}?endpoint=stocks`);
        if (!response.ok) throw new Error('Failed to fetch stocks');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Expected array of stocks');
        setStocks(data);
        setErrorStocks(null);
      } catch (error: any) {
        setErrorStocks(error.message);
        setStocks([]);
      } finally {
        setLoadingStocks(false);
      }
    };

    const fetchChemicals = async () => {
      setLoadingChemicals(true);
      try {
        const response = await fetch(`${BASE_URL}?endpoint=chemicals`);
        if (!response.ok) throw new Error('Failed to fetch chemicals');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Expected array of chemicals');
        setChemicals(data);
        setErrorChemicals(null);
      } catch (error: any) {
        setErrorChemicals(error.message);
        setChemicals([]);
      } finally {
        setLoadingChemicals(false);
      }
    };

    fetchStocks();
    fetchChemicals();
  }, []);

  // Filtering logic
  const filteredStocks = useMemo(() => {
    let result = stocks;
    if (filterStart) result = result.filter(stock => new Date(stock.date) >= new Date(filterStart));
    if (filterEnd) result = result.filter(stock => new Date(stock.date) <= new Date(filterEnd));
    if (minCPO) result = result.filter(stock => sumValues(stock.cpo) >= Number(minCPO));
    if (maxCPO) result = result.filter(stock => sumValues(stock.cpo) <= Number(maxCPO));
    if (minRefinedOil) result = result.filter(stock => sumValues(stock.refinedOil) >= Number(minRefinedOil));
    if (maxRefinedOil) result = result.filter(stock => sumValues(stock.refinedOil) <= Number(maxRefinedOil));
    if (tankFilter.length > 0) result = result.filter(stock => tankFilter.includes(String(stock.tanks?.length || 0)));
    return result;
  }, [stocks, filterStart, filterEnd, minCPO, maxCPO, minRefinedOil, maxRefinedOil, tankFilter]);

  const cpoTrendData = useMemo(() => {
    const groupedStocks = groupByTimeframe(filteredStocks, timeframe);
    return Object.entries(groupedStocks)
      .map(([date, group]) => ({
        date,
        cpo: group.reduce((sum, stock) => sum + sumValues(stock.cpo), 0),
        refinedOil: group.reduce((sum, stock) => sum + sumValues(stock.refinedOil), 0),
        deodorizerPower: group.reduce((sum, stock) => sum + sumValues(stock.deodorizerPower), 0),
        fractionationPower: group.reduce((sum, stock) => sum + sumValues(stock.fractionationPower), 0),
        tanks: group.reduce((sum, stock) => sum + (stock.tanks?.length || 0), 0),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredStocks, timeframe]);

  const chemicalPieData = useMemo(() => {
    const groupedChemicals = groupByTimeframe(chemicals, timeframe);
    let totalBleaching = 0, totalPhosphoric = 0, totalCitric = 0;
    Object.values(groupedChemicals).forEach(group => {
      totalBleaching += group.reduce((sum, c) => sum + sumValues(c.bleachingEarth), 0);
      totalPhosphoric += group.reduce((sum, c) => sum + sumValues(c.phosphoricAcid), 0);
      totalCitric += group.reduce((sum, c) => sum + sumValues(c.citricAcid), 0);
    });
    return [
      { name: 'Bleaching Earth', value: totalBleaching },
      { name: 'Phosphoric Acid', value: totalPhosphoric },
      { name: 'Citric Acid', value: totalCitric },
    ].filter(item => item.value > 0);
  }, [chemicals, timeframe]);

  const totalCPO = cpoTrendData.reduce((sum, d) => sum + d.cpo, 0);
  const totalRefinedOil = cpoTrendData.reduce((sum, d) => sum + d.refinedOil, 0);
  const totalTanks = cpoTrendData.reduce((sum, d) => sum + d.tanks, 0);

  const latestStocks = useMemo(() => filteredStocks.slice(0, 5), [filteredStocks]);

  // Bar chart data for CPO and Refined Oil
  const barChartData = cpoTrendData.map(d => ({
    date: d.date,
    cpo: d.cpo,
    refinedOil: d.refinedOil,
  }));

  // Export handler
  const handleExportCSV = () => {
    const rows = [
      ['Date', 'CPO', 'Refined Oil', 'Deodorizer Power', 'Fractionation Power', 'Tanks'],
      ...latestStocks.map(stock => [
        formatDate(new Date(stock.date)),
        sumValues(stock.cpo).toLocaleString(),
        sumValues(stock.refinedOil).toLocaleString(),
        sumValues(stock.deodorizerPower).toLocaleString(),
        sumValues(stock.fractionationPower).toLocaleString(),
        stock.tanks?.length?.toString() || '0',
      ]),
    ];
    downloadCSV(rows, 'latest_stock_entries.csv');
  };

  // Unique tank counts for filter options
  const tankCounts = useMemo(() => Array.from(new Set(stocks.map(s => String(s.tanks?.length || 0)))), [stocks]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">General Overview Report</h1>

      {/* Advanced Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="timeframe" className="mr-2 font-semibold">Timeframe:</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={e => setTimeframe(e.target.value as Timeframe)}
            className="border px-2 py-1 rounded"
            aria-label="Select timeframe"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="mr-2">From:</label>
          <input
            type="date"
            value={filterStart}
            onChange={e => setFilterStart(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="mr-2">To:</label>
          <input
            type="date"
            value={filterEnd}
            onChange={e => setFilterEnd(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="mr-2">Min CPO:</label>
          <input type="number" value={minCPO} onChange={e => setMinCPO(e.target.value)} className="border px-2 py-1 rounded w-24" />
        </div>
        <div>
          <label className="mr-2">Max CPO:</label>
          <input type="number" value={maxCPO} onChange={e => setMaxCPO(e.target.value)} className="border px-2 py-1 rounded w-24" />
        </div>
        <div>
          <label className="mr-2">Min Refined Oil:</label>
          <input type="number" value={minRefinedOil} onChange={e => setMinRefinedOil(e.target.value)} className="border px-2 py-1 rounded w-24" />
        </div>
        <div>
          <label className="mr-2">Max Refined Oil:</label>
          <input type="number" value={maxRefinedOil} onChange={e => setMaxRefinedOil(e.target.value)} className="border px-2 py-1 rounded w-24" />
        </div>
        <div>
          <label className="mr-2">Tanks:</label>
          <select multiple value={tankFilter} onChange={e => setTankFilter(Array.from(e.target.selectedOptions, o => o.value))} className="border px-2 py-1 rounded">
            {tankCounts.map(tc => (
              <option key={tc} value={tc}>{tc}</option>
            ))}
          </select>
        </div>
        <button
          className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => {
            setFilterStart('');
            setFilterEnd('');
            setMinCPO('');
            setMaxCPO('');
            setMinRefinedOil('');
            setMaxRefinedOil('');
            setTankFilter([]);
          }}
        >
          Reset Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-6 mb-8">
        <div className="bg-blue-100 rounded p-4 min-w-[160px]">
          <div className="text-lg font-semibold">Total CPO</div>
          <div className="text-2xl font-bold">{totalCPO.toLocaleString()}</div>
        </div>
        <div className="bg-green-100 rounded p-4 min-w-[160px]">
          <div className="text-lg font-semibold">Total Refined Oil</div>
          <div className="text-2xl font-bold">{totalRefinedOil.toLocaleString()}</div>
        </div>
        <div className="bg-yellow-100 rounded p-4 min-w-[160px]">
          <div className="text-lg font-semibold">Total Tanks</div>
          <div className="text-2xl font-bold">{totalTanks.toLocaleString()}</div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">CPO, Refined Oil & Deodorizer Power (Stacked Bar)</h2>
        <p className="text-xs text-gray-500 mb-2">
          <strong>X-axis:</strong> {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} <span className="mx-1">|</span>
          <strong>Y-axis:</strong> Quantity (MT)
          <span className="mx-2">|</span>
          <span className="italic">Shows the total CPO, Refined Oil, and Deodorizer Power for each period.</span>
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={cpoTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Quantity (MT)', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="cpo" stackId="a" fill="#2563eb" name="CPO" />
            <Bar dataKey="refinedOil" stackId="a" fill="#22c55e" name="Refined Oil" />
            <Bar dataKey="deodorizerPower" stackId="a" fill="#f59e42" name="Deodorizer Power" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Area Chart for CPO, Refined Oil & Deodorizer Power */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">CPO, Refined Oil & Deodorizer Power (Area Chart)</h2>
        <p className="text-xs text-gray-500 mb-2">
          <strong>X-axis:</strong> {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} <span className="mx-1">|</span>
          <strong>Y-axis:</strong> Quantity (MT)
          <span className="mx-2">|</span>
          <span className="italic">Trend lines for each product over time.</span>
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={cpoTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Quantity (MT)', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="cpo" stroke="#2563eb" fill="#2563eb" name="CPO" dot={false} strokeWidth={2} fillOpacity={0.2} />
            <Line type="monotone" dataKey="refinedOil" stroke="#22c55e" fill="#22c55e" name="Refined Oil" dot={false} strokeWidth={2} fillOpacity={0.2} />
            <Line type="monotone" dataKey="deodorizerPower" stroke="#f59e42" fill="#f59e42" name="Deodorizer Power" dot={false} strokeWidth={2} fillOpacity={0.2} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Example for a single metric trend */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">CPO Trend</h2>
        <p className="text-xs text-gray-500 mb-2">
          <strong>X-axis:</strong> {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} <span className="mx-1">|</span>
          <strong>Y-axis:</strong> CPO (MT)
          <span className="mx-2">|</span>
          <span className="italic">Shows the trend of CPO production over time.</span>
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cpoTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'CPO (MT)', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="cpo" stroke="#2563eb" name="CPO" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Refined Oil Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cpoTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="refinedOil" stroke="#22c55e" name="Refined Oil" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Deodorizer Power Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cpoTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="deodorizerPower" stroke="#f59e42" name="Deodorizer Power" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Fractionation Power Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cpoTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="fractionationPower" stroke="#a855f7" name="Fractionation Power" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tanks Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cpoTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="tanks" stroke="#eab308" name="Tanks" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Doughnut Chart for Chemical Usage */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Chemical Usage (Doughnut)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chemicalPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
            >
              {chemicalPieData.map((_, index) => (
                <Cell key={`cell-doughnut-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">CPO, Refined Oil & Deodorizer Power (Pie Chart)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: 'CPO', value: totalCPO },
                { name: 'Refined Oil', value: totalRefinedOil },
                { name: 'Deodorizer Power', value: cpoTrendData.reduce((sum, d) => sum + d.deodorizerPower, 0) }
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
            >
              <Cell fill="#2563eb" />
              <Cell fill="#22c55e" />
              <Cell fill="#f59e42" />
            </Pie>
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chemical Usage Over Time (Stacked Area)</h2>
        <p className="text-xs text-gray-500 mb-2">
          <strong>X-axis:</strong> {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} <span className="mx-1">|</span>
          <strong>Y-axis:</strong> Quantity (kg)
          <span className="mx-2">|</span>
          <span className="italic">Tracks the usage of Bleaching Earth, Phosphoric Acid, and Citric Acid over time.</span>
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={useMemo(() => {
            // Group chemicals by timeframe
            const grouped = groupByTimeframe(chemicals, timeframe);
            return Object.entries(grouped).map(([date, group]) => ({
              date,
              bleachingEarth: group.reduce((sum, c) => sum + sumValues(c.bleachingEarth), 0),
              phosphoricAcid: group.reduce((sum, c) => sum + sumValues(c.phosphoricAcid), 0),
              citricAcid: group.reduce((sum, c) => sum + sumValues(c.citricAcid), 0),
            })).sort((a, b) => a.date.localeCompare(b.date));
          }, [chemicals, timeframe])}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="bleachingEarth" stackId="a" fill="#f59e42" name="Bleaching Earth" />
            <Bar dataKey="phosphoricAcid" stackId="a" fill="#2563eb" name="Phosphoric Acid" />
            <Bar dataKey="citricAcid" stackId="a" fill="#22c55e" name="Citric Acid" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Average CPO vs Refined Oil (Line Chart)</h2>
        <p className="text-xs text-gray-500 mb-2">
          <strong>X-axis:</strong> {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} <span className="mx-1">|</span>
          <strong>Y-axis:</strong> Average Quantity (MT)
          <span className="mx-2">|</span>
          <span className="italic">Compares average CPO and Refined Oil per period.</span>
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={useMemo(() => {
            const grouped = groupByTimeframe(filteredStocks, timeframe);
            return Object.entries(grouped).map(([date, group]) => ({
              date,
              avgCPO: group.length ? group.reduce((sum, s) => sum + sumValues(s.cpo), 0) / group.length : 0,
              avgRefinedOil: group.length ? group.reduce((sum, s) => sum + sumValues(s.refinedOil), 0) / group.length : 0,
            })).sort((a, b) => a.date.localeCompare(b.date));
          }, [filteredStocks, timeframe])}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Avg Quantity (MT)', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip formatter={(value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
            <Legend />
            <Line type="monotone" dataKey="avgCPO" stroke="#2563eb" name="Avg CPO" />
            <Line type="monotone" dataKey="avgRefinedOil" stroke="#22c55e" name="Avg Refined Oil" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Latest Stock Entries</h2>
        {loadingStocks ? (
          <p>Loading stocks...</p>
        ) : errorStocks ? (
          <p className="text-red-600" role="alert">Error: {errorStocks}</p>
        ) : latestStocks.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300" role="table">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">CPO</th>
                  <th className="border px-2 py-1">Refined Oil</th>
                  <th className="border px-2 py-1">Deodorizer Power</th>
                  <th className="border px-2 py-1">Fractionation Power</th>
                  <th className="border px-2 py-1">Tanks</th>
                </tr>
              </thead>
              <tbody>
                {latestStocks.map(stock => (
                  <tr key={stock.id}>
                    <td className="border px-2 py-1">{formatDate(new Date(stock.date))}</td>
                    <td className="border px-2 py-1">{sumValues(stock.cpo).toLocaleString()}</td>
                    <td className="border px-2 py-1">{sumValues(stock.refinedOil).toLocaleString()}</td>
                    <td className="border px-2 py-1">{sumValues(stock.deodorizerPower).toLocaleString()}</td>
                    <td className="border px-2 py-1">{sumValues(stock.fractionationPower).toLocaleString()}</td>
                    <td className="border px-2 py-1">{stock.tanks?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent stock entries</p>
        )}
      </section>

      {/* Tanks Count Distribution */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tanks Count Distribution</h2>
        <p className="text-xs text-gray-500 mb-2">
          <strong>X-axis:</strong> Number of Tanks <span className="mx-1">|</span>
          <strong>Y-axis:</strong> Number of Records
          <span className="mx-2">|</span>
          <span className="italic">Shows how frequently each tank count appears in the selected data.</span>
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={useMemo(() => {
              const counts: Record<string, number> = {};
              filteredStocks.forEach(s => {
                const tanks = String(s.tanks?.length || 0);
                counts[tanks] = (counts[tanks] || 0) + 1;
              });
              return Object.entries(counts).map(([tanks, count]) => ({ tanks, count }));
            }, [filteredStocks])}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tanks" label={{ value: 'Tanks', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Records', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#eab308" name="Records" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Reports;