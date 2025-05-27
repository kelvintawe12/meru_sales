
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { FaSpinner } from 'react-icons/fa';

// Colors for charts
const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#a855f7', '#f43f5e', '#eab308', '#14b8a6'];

// Interfaces
interface RawDispatchRow {
  DATE: string | null;
  'S.O. NO': string | null;
  INVOICENO: string | null;
  'CUSTOMER&DEPOTNAME': string | null;
  TRUCKstatus: string | null;
  '20L': string | null;
  '10L': string | null;
  '5L': string | null;
  '3L': string | null;
  '1L': string | null;
  '250ML': string | null;
  '500ML': string | null;
  MT: string | null;
}

interface DispatchOrder {
  id: string;
  date: string;
  soNumber: string;
  customerName: string;
  status: string;
  quantities: {
    '20L': number;
    '10L': number;
    '5L': number;
    '3L': number;
    '1L': number;
    '250ML': number;
    '500ML': number;
  };
  metricTons: number;
}

interface TrendData {
  date: string;
  metricTons: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface ProductDistribution {
  name: string;
  value: number;
}

interface CustomerDistribution {
  customer: string;
  orders: number;
}

// Card component
interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

const Submissions: React.FC = () => {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Parse Excel serial date
  const parseExcelDate = (serial: number): Date => {
    if (isNaN(serial)) return new Date();
    return new Date((serial - 25569) * 86400 * 1000);
  };

  // Load and process data
  useEffect(() => {
    const csvData = loadFileData('AIL_DISPATCH 26-May-2025.xlsx');
    Papa.parse<RawDispatchRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/\s+/g, '').replace(/^"|"$/g, ''),
      transform: (value) => (value.trim() === '' ? null : value.trim()),
      complete: (results) => {
        const parsedOrders: DispatchOrder[] = results.data
          .filter((row) => row.DATE && row.MT && !isNaN(parseFloat(row.MT)))
          .map((row) => {
            const date = parseExcelDate(parseFloat(row.DATE!));
            return {
              id: row.INVOICENO || Date.now().toString(),
              date: date.toISOString().split('T')[0],
              soNumber: row['S.O. NO'] || 'N/A',
              customerName: row['CUSTOMER&DEPOTNAME'] || 'Unknown',
              status: row.TRUCKstatus || 'Pending',
              quantities: {
                '20L': parseFloat(row['20L'] || '0'),
                '10L': parseFloat(row['10L'] || '0'),
                '5L': parseFloat(row['5L'] || '0'),
                '3L': parseFloat(row['3L'] || '0'),
                '1L': parseFloat(row['1L'] || '0'),
                '250ML': parseFloat(row['250ML'] || '0'),
                '500ML': parseFloat(row['500ML'] || '0'),
              },
              metricTons: parseFloat(row.MT!),
            };
          })
          .filter((order) => order.date <= new Date().toISOString().split('T')[0]);

        setOrders(parsedOrders);
        setLoading(false);
      },
      error: () => {
        setError('Failed to load dispatch submissions');
        setLoading(false);
      },
    });
  }, []);

  // Prepare chart and table data
  const trendData: TrendData[] = orders.reduce((acc, order) => {
    const existing = acc.find((d) => d.date === order.date);
    if (existing) {
      existing.metricTons += order.metricTons;
      if (order.status === 'Delivered') {
        existing.deliveredOrders += 1;
      } else {
        existing.pendingOrders += 1;
      }
    } else {
      acc.push({
        date: order.date,
        metricTons: order.metricTons,
        pendingOrders: order.status === 'Pending' ? 1 : 0,
        deliveredOrders: order.status === 'Delivered' ? 1 : 0,
      });
    }
    return acc;
  }, [] as TrendData[]).sort((a, b) => a.date.localeCompare(b.date));

  const productDist: ProductDistribution[] = Object.keys(orders[0]?.quantities || {}).map((size) => ({
    name: size,
    value: orders.reduce((sum, o) => sum + o.quantities[size as keyof DispatchOrder['quantities']], 0),
  })).filter((d) => d.value > 0);

  const customerDist: CustomerDistribution[] = Object.entries(
    orders.reduce((acc, o) => {
      acc[o.customerName] = (acc[o.customerName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([customer, orders]) => ({ customer, orders }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  const summaryTableData = orders
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
    .map((order) => ({
      date: new Date(order.date).toLocaleDateString('en-GB'),
      soNumber: order.soNumber,
      customer: order.customerName,
      metricTons: order.metricTons.toFixed(1),
      status: order.status,
    }));

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dispatch Submissions</h1>

      {/* Trend Line Chart */}
      <Card title="Dispatch Trends">
        {loading ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-blue-600" size={24} />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : trendData.length === 0 ? (
          <p className="text-gray-600">No dispatch data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'MT', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Orders', angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value: number, name: string) => [value.toFixed(name === 'metricTons' ? 1 : 0), name]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="metricTons" stroke="#2563eb" name="Metric Tons" />
              <Line yAxisId="right" type="monotone" dataKey="pendingOrders" stroke="#f59e42" name="Pending Orders" />
              <Line yAxisId="right" type="monotone" dataKey="deliveredOrders" stroke="#22c55e" name="Delivered Orders" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Pie Chart */}
      <Card title="Product Size Distribution">
        {loading ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-blue-600" size={24} />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : productDist.length === 0 ? (
          <p className="text-gray-600">No product data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={productDist}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
              >
                {productDist.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} units`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Bar Chart */}
      <Card title="Top Customers (Orders)">
        {loading ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-blue-600" size={24} />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : customerDist.length === 0 ? (
          <p className="text-gray-600">No customer data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={customerDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="customer" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'Orders', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `${value} orders`} />
              <Legend />
              <Bar dataKey="orders" fill="#2563eb" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Summary Table */}
      <Card title="Recent Submissions">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase">Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase">S.O. No</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase">Customer</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase">MT</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <FaSpinner className="animate-spin text-blue-600" size={24} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center text-red-600 py-4">{error}</td>
                </tr>
              ) : summaryTableData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-600 py-4">No submissions available.</td>
                </tr>
              ) : (
                summaryTableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{row.date}</td>
                    <td className="px-4 py-2 text-gray-800">{row.soNumber}</td>
                    <td className="px-4 py-2 text-gray-800">{row.customer}</td>
                    <td className="px-4 py-2 text-gray-800">{row.metricTons}</td>
                    <td className="px-4 py-2 text-gray-800">{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Submissions;