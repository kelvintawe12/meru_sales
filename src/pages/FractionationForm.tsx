
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Interface for raw CSV row
interface DispatchRow {
  DATE: string | null;
  SONO: string | null;
  TICKETNO: string | null;
  INVOICENO: string | null;
  TRUCKNO: string | null;
  DRIVERNO: string | null;
  TRANSPORTER: string | null;
  DISPATCHTO: string | null;
  'CUSTOMER&DEPOTNAME': string | null;
  '20L': string | null;
  '10L': string | null;
  '5L': string | null;
  '3L': string | null;
  '1L': string | null;
  '250ML': string | null;
  '500ML': string | null;
  MT: string | null;
  TRUCKstatus: string | null;
  GATEPASSNo: string | null;
}

// Interface for cleaned data
interface CleanedRow {
  Date: string;
  SONO: string;
  TicketNo: string;
  InvoiceNo: string;
  TruckNo: string;
  DriverNo: string;
  Transporter: string;
  DispatchTo: string;
  CustomerDepot: string;
  '20L': number;
  '10L': number;
  '5L': number;
  '3L': number;
  '1L': number;
  '250ML': number;
  '500ML': number;
  MT: number;
  TruckStatus: string;
  GatePassNo: string;
}

// Interface for chart data
interface ChartData {
  name: string;
  value: number;
}

interface DailyData {
  date: string;
  '20L': number;
  '10L': number;
  '5L': number;
  '250ML': number;
}

const FractionationForm: React.FC = () => {
  const [data, setData] = useState<CleanedRow[]>([]);
  const [filteredData, setFilteredData] = useState<CleanedRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [dispatchType, setDispatchType] = useState<string>('All');

  // Parse Excel serial date
  const parseExcelDate = (serial: number): string => {
    if (isNaN(serial)) return 'Unknown';
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Load and parse data
  useEffect(() => {
    const csvData = loadFileData('AIL_DISPATCH 26-May-2025.xlsx');
    Papa.parse<DispatchRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/\s+/g, '').replace(/^"|"$/g, ''),
      transform: (value) => (value.trim() === '' ? null : value.trim()),
      complete: (results) => {
        const cleanedData: CleanedRow[] = results.data
          .filter((row) => row.DATE && row.MT && !isNaN(parseFloat(row.MT)))
          .map((row) => ({
            Date: parseExcelDate(parseFloat(row.DATE!)),
            SONO: row.SONO || 'N/A',
            TicketNo: row.TICKETNO || 'N/A',
            InvoiceNo: row.INVOICENO || 'N/A',
            TruckNo: row.TRUCKNO || 'N/A',
            DriverNo: row.DRIVERNO || 'N/A',
            Transporter: row.TRANSPORTER || 'N/A',
            DispatchTo: row.DISPATCHTO || 'N/A',
            CustomerDepot: row['CUSTOMER&DEPOTNAME'] || 'N/A',
            '20L': parseFloat(row['20L'] || '0'),
            '10L': parseFloat(row['10L'] || '0'),
            '5L': parseFloat(row['5L'] || '0'),
            '3L': parseFloat(row['3L'] || '0'),
            '1L': parseFloat(row['1L'] || '0'),
            '250ML': parseFloat(row['250ML'] || '0'),
            '500ML': parseFloat(row['500ML'] || '0'),
            MT: parseFloat(row.MT!),
            TruckStatus: row.TRUCKstatus || 'N/A',
            GatePassNo: row.GATEPASSNo || 'N/A',
          }));
        setData(cleanedData);
        setFilteredData(cleanedData);
        setLoading(false);
      },
      error: (err) => {
        setError('Failed to load data');
        setLoading(false);
      },
    });
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...data];
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter((row) => {
        const rowDate = new Date(row.Date);
        return rowDate >= startDate && rowDate <= endDate;
      });
    }
    if (dispatchType !== 'All') {
      filtered = filtered.filter((row) => row.DispatchTo === dispatchType);
    }
    setFilteredData(filtered);
  }, [dateRange, dispatchType, data]);

  // Aggregate data for charts
  const aggregateByProduct = (): ChartData[] => {
    const products = ['20L', '10L', '5L', '3L', '1L', '250ML', '500ML'];
    const totals = products.reduce((acc, prod) => {
      acc[prod] = filteredData.reduce((sum, row) => sum + row[prod], 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const aggregateByDispatchType = (): ChartData[] => {
    const grouped: Record<string, number> = { Customer: 0, Depot: 0, Export: 0 };
    filteredData.forEach((row) => {
      if (row.DispatchTo === 'CUSTOMER') grouped.Customer += row.MT;
      else if (row.DispatchTo === 'DEPOT') grouped.Depot += row.MT;
      else if (row.DispatchTo === 'EXPORT') grouped.Export += row.MT;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  };

  const aggregateByDate = (): DailyData[] => {
    const grouped: Record<string, DailyData> = {};
    filteredData.forEach((row) => {
      if (!grouped[row.Date]) {
        grouped[row.Date] = { date: row.Date, '20L': 0, '10L': 0, '5L': 0, '250ML': 0 };
      }
      grouped[row.Date]['20L'] += row['20L'];
      grouped[row.Date]['10L'] += row['10L'];
      grouped[row.Date]['5L'] += row['5L'];
      grouped[row.Date]['250ML'] += row['250ML'];
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const topCustomers = (): Array<{ name: string; MT: number; '20L': number; '10L': number; InvoiceNo: string }> => {
    const grouped: Record<string, { MT: number; '20L': number; '10L': number; InvoiceNo: string }> = {};
    filteredData.forEach((row) => {
      const key = row.CustomerDepot;
      if (!grouped[key]) {
        grouped[key] = { MT: 0, '20L': 0, '10L': 0, InvoiceNo: row.InvoiceNo };
      }
      grouped[key].MT += row.MT;
      grouped[key]['20L'] += row['20L'];
      grouped[key]['10L'] += row['10L'];
    });
    return Object.entries(grouped)
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.MT - a.MT)
      .slice(0, 5);
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('Fractionation Dorm - Oil Dispatch Analysis', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Meru Sales Ltd.', 20, 30);
    doc.text('123 Business Avenue, Nairobi, Kenya', 20, 40);

    doc.setFontSize(14);
    doc.text('Summary', 20, 60);
    doc.setFontSize(10);
    doc.text('Analysis of oil dispatch by product size and type for May 2025.', 20, 70, { maxWidth: 170 });

    doc.autoTable({
      startY: 80,
      head: [['Customer/Depot', 'Total MT', '20L Units', '10L Units', 'Invoice No']],
      body: topCustomers().map((c) => [c.name, c.MT.toFixed(2), c['20L'], c['10L'], c.InvoiceNo]),
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
    });

    doc.save('FractionationDorm.pdf');
  };

  // Share handlers
  const handleShare = async () => {
    const shareData = {
      title: 'Fractionation Dorm - Oil Dispatch Analysis',
      text: 'Oil dispatch analysis for May 2025 from Meru Sales Ltd.',
      url: 'https://merusales.co.ke/fractionation-dorm',
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Sharing error:', err);
      }
    } else {
      alert('Native sharing not supported. Use buttons below.');
    }
  };

  const handleEmailShare = () => {
    const subject = 'Fractionation Dorm - Oil Dispatch Analysis';
    const body = 'Attached is the oil dispatch analysis for May 2025.\n\nMeru Sales Ltd.';
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleWhatsAppShare = () => {
    const message = 'Fractionation Dorm Report for May 2025: https://merusales.co.ke/fractionation-dorm';
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://merusales.co.ke/fractionation-dorm')
      .then(() => alert('Link copied!'))
      .catch(() => alert('Failed to copy link.'));
  };

  if (loading) return <div className="text-center text-xl p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8 bg-blue-600 text-white rounded-lg shadow-xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            Logo
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">Fractionation Dorm - Oil Dispatch Analysis</h1>
            <p className="text-sm mt-2">Meru Sales Ltd. | May 2025</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Filters */}
        <section className="mb-8 flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Dispatch Type</label>
            <select
              className="border rounded px-2 py-1"
              value={dispatchType}
              onChange={(e) => setDispatchType(e.target.value)}
            >
              <option value="All">All</option>
              <option value="CUSTOMER">Customer</option>
              <option value="DEPOT">Depot</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>
        </section>

        {/* Visualizations */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Fractionation Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Product Sizes */}
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Dispatch by Product Size</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aggregateByProduct()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} units`} />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" name="Units" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart: Dispatch Type */}
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Dispatch Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={aggregateByDispatchType()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value.toFixed(2)} MT`}
                  >
                    {aggregateByDispatchType().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#2563eb', '#dc2626', '#16a34a'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} MT`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart: Daily Trends */}
            <div className="bg-gray-50 p-4 rounded-lg shadow col-span-1 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Daily Dispatch Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={aggregateByDate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="20L" stroke="#2563eb" name="20L" />
                  <Line type="monotone" dataKey="10L" stroke="#dc2626" name="10L" />
                  <Line type="monotone" dataKey="5L" stroke="#16a34a" name="5L" />
                  <Line type="monotone" dataKey="250ML" stroke="#f59e0b" name="250ML" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Customers/Depots</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 border">Customer/Depot</th>
                  <th className="px-4 py-2 border">Total MT</th>
                  <th className="px-4 py-2 border">20L Units</th>
                  <th className="px-4 py-2 border">10L Units</th>
                  <th className="px-4 py-2 border">Invoice No</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers().map((customer, index) => (
                  <tr key={index} className="bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border">{customer.name}</td>
                    <td className="px-4 py-2 border">{customer.MT.toFixed(2)}</td>
                    <td className="px-4 py-2 border">{customer['20L']}</td>
                    <td className="px-4 py-2 border">{customer['10L']}</td>
                    <td className="px-4 py-2 border">{customer.InvoiceNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Share Options */}
        <section className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download PDF
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Share
          </button>
          <button
            onClick={handleEmailShare}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Email
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Copy Link
          </button>
        </section>
      </main>
    </div>
  );
};

export default FractionationForm;