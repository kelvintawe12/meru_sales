
import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
  BarChart, Bar, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { FaChartBar, FaTruck, FaWeightHanging, FaPercentage, FaPlus, FaSpinner } from 'react-icons/fa';

// Interfaces
interface RawDispatchRow {
  DATE: string | null;
  SONO: string | null;
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
  customerName: string;
  date: Date;
  soNumber: string;
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

import { IconType } from 'react-icons';

interface Stat {
  label: string;
  value: string;
  icon: IconType;
  bg: string;
  sub?: string;
  subClassName?: string;
}

interface DailyDispatch {
  date: string;
  metricTons: number;
}

interface ProductDistribution {
  name: string;
  value: number;
}

interface CustomerDistribution {
  customer: string;
  orders: number;
}

interface StatusTrend {
  date: string;
  pending: number;
  delivered: number;
}

// Card component
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
    {children}
  </div>
);

// Colors for charts
const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#a855f7', '#eab308', '#ef4444', '#0ea5e9'];

// Generate dynamic data with variation
const generateDynamicData = <T extends object>(data: T[], variation: number = 0.1): T[] => {
  return data.map((item) => {
    const newItem = { ...item } as any;
    if ('value' in item && typeof (item as any).value === 'number') {
      newItem.value = Math.max(0, (item as any).value * (1 + (Math.random() * variation - variation / 2)));
    }
    if ('orders' in item && typeof (item as any).orders === 'number') {
      newItem.orders = Math.max(0, Math.round((item as any).orders * (1 + (Math.random() * variation - variation / 2))));
    }
    if ('metricTons' in item && typeof (item as any).metricTons === 'number') {
      newItem.metricTons = Math.max(0, (item as any).metricTons * (1 + (Math.random() * variation - variation / 2)));
    }
    if ('pending' in item && typeof (item as any).pending === 'number') {
      newItem.pending = Math.max(0, Math.round((item as any).pending * (1 + (Math.random() * variation - variation / 2))));
    }
    if ('delivered' in item && typeof (item as any).delivered === 'number') {
      newItem.delivered = Math.max(0, Math.round((item as any).delivered * (1 + (Math.random() * variation - variation / 2))));
    }
    return newItem;
  });
};

const loadFileData = async (filePath: string): Promise<string> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${filePath}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    console.error(error);
    return '';
  }
};

const isRawDispatchRow = (obj: any): obj is RawDispatchRow => {
  return obj && typeof obj === 'object' &&
    'DATE' in obj && (typeof obj.DATE === 'string' || obj.DATE === null) &&
    'MT' in obj && (typeof obj.MT === 'string' || obj.MT === null) &&
    'CUSTOMER&DEPOTNAME' in obj && (typeof obj['CUSTOMER&DEPOTNAME'] === 'string' || obj['CUSTOMER&DEPOTNAME'] === null) &&
    'TRUCKstatus' in obj && (typeof obj.TRUCKstatus === 'string' || obj.TRUCKstatus === null) &&
    'SONO' in obj && (typeof obj.SONO === 'string' || obj.SONO === null) &&
    'INVOICENO' in obj && (typeof obj.INVOICENO === 'string' || obj.INVOICENO === null) &&
    '20L' in obj && (typeof obj['20L'] === 'string' || obj['20L'] === null) &&
    '10L' in obj && (typeof obj['10L'] === 'string' || obj['10L'] === null) &&
    '5L' in obj && (typeof obj['5L'] === 'string' || obj['5L'] === null) &&
    '3L' in obj && (typeof obj['3L'] === 'string' || obj['3L'] === null) &&
    '1L' in obj && (typeof obj['1L'] === 'string' || obj['1L'] === null) &&
    '250ML' in obj && (typeof obj['250ML'] === 'string' || obj['250ML'] === null) &&
    '500ML' in obj && (typeof obj['500ML'] === 'string' || obj['500ML'] === null) &&
    typeof obj.DATE !== 'undefined' &&
    typeof obj.MT !== 'undefined' &&
    typeof obj['CUSTOMER&DEPOTNAME'] !== 'undefined' &&
    typeof obj.TRUCKstatus !== 'undefined' &&
    typeof obj.SONO !== 'undefined' &&
    typeof obj.INVOICENO !== 'undefined' &&
    typeof obj['20L'] !== 'undefined' &&
    typeof obj['10L'] !== 'undefined' &&
    typeof obj['5L'] !== 'undefined' &&
    typeof obj['3L'] !== 'undefined' &&
    typeof obj['1L'] !== 'undefined' &&
    typeof obj['250ML'] !== 'undefined' &&
    typeof obj['500ML'] !== 'undefined';
};

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [dailyDispatch, setDailyDispatch] = useState<DailyDispatch[]>([]);
  const [productDist, setProductDist] = useState<ProductDistribution[]>([]);
  const [customerDist, setCustomerDist] = useState<CustomerDistribution[]>([]);
  const [statusTrend, setStatusTrend] = useState<StatusTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Parse Excel serial date
  const parseExcelDate = (serial: number): Date => {
    if (isNaN(serial)) return new Date();
    return new Date((serial - 25569) * 86400 * 1000);
  };

  // Load and process Excel data
  useEffect(() => {
    const fetchAndParse = async () => {
      const csvData = await loadFileData('AIL_DISPATCH 26-May-2025.xlsx');
      Papa.parse<RawDispatchRow>(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().replace(/\s+/g, '').replace(/^"|"$/g, ''),
        transform: (value) => (value.trim() === '' ? null : value.trim()),
        complete: (results) => {
          if (!Array.isArray(results.data)) {
            setError('Invalid data format');
            setLoading(false);
            return;
          }
          const rawData = results.data as unknown[];
          const filteredData = rawData.filter(isRawDispatchRow) as RawDispatchRow[];
          const parsedOrders: DispatchOrder[] = filteredData
            .filter((row) => row.DATE && row.MT && !isNaN(parseFloat(row.MT)))
            .map((row: RawDispatchRow) => {
              return {
                id: row.INVOICENO || Date.now().toString(),
                customerName: row['CUSTOMER&DEPOTNAME'] || 'Unknown',
                date: parseExcelDate(parseFloat(row.DATE!)),
                soNumber: row.SONO || 'N/A',
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
            });

        // Calculate stats
        const pendingOrders = parsedOrders.filter((o) => o.status === 'Delivered').length;
        const totalMT = parsedOrders.reduce((sum, o) => sum + o.metricTons, 0);
        const productTotals = Object.keys(parsedOrders[0]?.quantities || {}).reduce((acc, key) => {
          acc[key as keyof DispatchOrder['quantities']] = parsedOrders.reduce((sum, o) => sum + o.quantities[key as keyof DispatchOrder['quantities']], 0);
          return acc;
        }, {} as any);
        const topProduct = Object.entries(productTotals).reduce((a, b) => (a[1] > b[1] ? a : b), ['Unknown', 0])[0];
        const pendingRatio = ((pendingOrders / parsedOrders.length) * 100).toFixed(1);

        setStats([
          {
            label: 'Pending Orders',
            value: `${pendingOrders}`,
            icon: FaTruck,
            bg: 'bg-blue-100',
            sub: `${parsedOrders.length - pendingOrders} delivered`,
            subClassName: 'text-green-600',
          },
          {
            label: 'Total MT',
            value: `${totalMT.toFixed(1)} MT`,
            icon: FaWeightHanging,
            bg: 'bg-green-100',
            sub: `${(totalMT / parsedOrders.length).toFixed(1)} MT/order`,
            subClassName: 'text-gray-600',
          },
          {
            label: 'Top Product',
            value: topProduct,
            icon: FaChartBar,
            bg: 'bg-purple-100',
            sub: `${productTotals[topProduct].toFixed(1)} units`,
            subClassName: 'text-gray-600',
          },
          {
            label: 'Pending Ratio',
            value: `${pendingRatio}%`,
            icon: FaPercentage,
            bg: 'bg-amber-100',
            sub: 'Of total orders',
            subClassName: 'text-gray-600',
          },
        ]);

        // Daily dispatch
        const daily = parsedOrders.reduce((acc, o) => {
          const dateStr = o.date.toISOString().split('T')[0];
          acc[dateStr] = (acc[dateStr] || 0) + o.metricTons;
          return acc;
        }, {} as Record<string, number>);
        setDailyDispatch(
          Object.entries(daily).map(([date, metricTons]) => ({ date, metricTons: parseFloat(metricTons.toFixed(1)) }))
        );

        // Product distribution
        setProductDist(
          Object.entries(productTotals).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
        );

        // Customer distribution
        const customerCounts = parsedOrders.reduce((acc, o) => {
          acc[o.customerName] = (acc[o.customerName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setCustomerDist(
          Object.entries(customerCounts)
            .map(([customer, orders]) => ({ customer, orders }))
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 5)
        );

        // Status trend
        const statusByDate = parsedOrders.reduce((acc, o) => {
          const dateStr = o.date.toISOString().split('T')[0];
          if (!acc[dateStr]) acc[dateStr] = { pending: 0, delivered: 0 };
          acc[dateStr][o.status === 'Delivered' ? 'delivered' : 'pending']++;
          return acc;
        }, {} as Record<string, { pending: number; delivered: number }>);
        setStatusTrend(
          Object.entries(statusByDate).map(([date, counts]) => ({
            date,
            pending: counts.pending,
            delivered: counts.delivered,
          }))
        );

        setOrders(parsedOrders);
        setLoading(false);
      },
      error: () => {
        setError('Failed to load dispatch data');
        setLoading(false);
      },
    });
    };
    fetchAndParse();
  }, []);

  // Periodic data update
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyDispatch(generateDynamicData(dailyDispatch));
      setProductDist(generateDynamicData(productDist));
      setCustomerDist(generateDynamicData(customerDist));
      setStatusTrend(generateDynamicData(statusTrend));
    }, 10000);
    return () => clearInterval(interval);
  }, [dailyDispatch, productDist, customerDist, statusTrend]);

  const handleDateChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    // Simulate data update
    setDailyDispatch(generateDynamicData(dailyDispatch));
    setProductDist(generateDynamicData(productDist));
    setCustomerDist(generateDynamicData(customerDist));
    setStatusTrend(generateDynamicData(statusTrend));
  }, 500);

  const setDaysBack = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const newDate = d.toISOString().split('T')[0];
    setDate(newDate);
    setDailyDispatch(generateDynamicData(dailyDispatch));
    setProductDist(generateDynamicData(productDist));
    setCustomerDist(generateDynamicData(customerDist));
    setStatusTrend(generateDynamicData(statusTrend));
  };

  const filteredOrders = orders.filter((o) => o.date.toISOString().split('T')[0] <= date);

  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dispatch Dashboard</h2>
          <p className="text-gray-600 text-sm">Monitor oil dispatch performance and orders</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-600 focus:border-blue-600"
          />
          <button
            className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setDaysBack(0)}
          >
            Today
          </button>
          <button
            className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setDaysBack(1)}
          >
            1d back
          </button>
          <button
            className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setDaysBack(7)}
          >
            7d back
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-4">
            <FaSpinner className="animate-spin text-blue-600" size={24} />
          </div>
        ) : (
          stats.map((stat) => (
            <Card key={stat.label} className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bg} mr-4`}>
                {stat.icon && React.createElement(stat.icon, { className: `text-current`, size: 24 })}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className={`text-xs ${stat.subClassName}`}>{stat.sub}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Recent Submissions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Dispatch Orders">
            {loading ? (
              <div className="flex justify-center py-4">
                <FaSpinner className="animate-spin text-blue-600" size={24} />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-gray-600">No orders for this date.</div>
            ) : (
              <ul>
                {filteredOrders.slice(0, 5).map((order) => (
                  <li
                    key={order.id}
                    className="p-3 border rounded-lg bg-blue-50 text-blue-900 mb-2 hover:bg-blue-100"
                  >
                    <strong>{order.soNumber}</strong> - {order.customerName}
                    <em className="ml-2 text-xs text-gray-600">
                      ({order.date.toLocaleDateString('en-GB')})
                    </em>
                    <div className="text-xs text-gray-700 mt-1">
                      {Object.entries(order.quantities)
                        .filter(([_, v]) => v > 0)
                        .map(([k, v]) => (
                          <span key={k} className="mr-3">
                            {k}: <span className="font-semibold">{v}</span>
                          </span>
                        ))}
                      MT: <span className="font-semibold">{order.metricTons.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-600">Status: {order.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div>
          <Card title="Quick Actions" className="relative">
            <div className="space-y-4">
              {[
                { to: '/chemicals', title: 'Add Order', desc: 'Enter new dispatch order' },
                { to: '/reports', title: 'View Reports', desc: 'Generate PDF reports' },
                { to: '/status', title: 'Update Status', desc: 'Mark orders as delivered' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block p-4 rounded-lg border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">
                      <span className="text-lg font-bold">{item.title[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/chemicals" className="absolute right-6 bottom-6">
              <div className="relative flex h-12 w-12">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40"></div>
                <div className="relative inline-flex rounded-full h-12 w-12 bg-blue-600 items-center justify-center text-white">
                  <FaPlus size={24} />
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Dispatch MT */}
        <Card title="Daily Dispatch (MT)">
          {loading ? (
            <div className="flex justify-center py-4">
              <FaSpinner className="animate-spin text-blue-600" size={24} />
            </div>
          ) : dailyDispatch.length === 0 ? (
            <div className="text-gray-600 text-center py-4">No dispatch data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyDispatch}>
                <defs>
                  <linearGradient id="dispatchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: 'MT', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)} MT`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="metricTons"
                  stroke="#2563eb"
                  fill="url(#dispatchGradient)"
                  name="Dispatched MT"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Product Distribution */}
        <Card title="Product Distribution">
          {loading ? (
            <div className="flex justify-center py-4">
              <FaSpinner className="animate-spin text-blue-600" size={24} />
            </div>
          ) : productDist.length === 0 ? (
            <div className="text-gray-600 text-center py-4">No product data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={productDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  label={({ name, value }: { name: string; value: number }) => `${name}: ${value.toFixed(1)}`}
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

        {/* Customer Distribution */}
        <Card title="Top Customers (Orders)">
          {loading ? (
            <div className="flex justify-center py-4">
              <FaSpinner className="animate-spin text-blue-600" size={24} />
            </div>
          ) : customerDist.length === 0 ? (
            <div className="text-gray-600 text-center py-4">No customer data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
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

        {/* Status Trend */}
        <Card title="Order Status Trend">
          {loading ? (
            <div className="flex justify-center py-4">
              <FaSpinner className="animate-spin text-blue-600" size={24} />
            </div>
          ) : statusTrend.length === 0 ? (
            <div className="text-gray-600 text-center py-4">No status data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={statusTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pending" stroke="#f59e42" name="Pending" />
                <Line type="monotone" dataKey="delivered" stroke="#22c55e" name="Delivered" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card title="Recent Orders">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">S.O. No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">MT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-600 py-4">No orders for this date.</td>
                </tr>
              ) : (
                filteredOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{order.date.toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{order.soNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{order.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{order.metricTons.toFixed(1)}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{order.status}</td>
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

export default Dashboard;