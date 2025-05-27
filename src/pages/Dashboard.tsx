import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
  BarChart, Bar, ResponsiveContainer, Legend, LabelList, LineChart, Line
} from 'recharts';
import { BarChart3Icon, TrendingUpIcon, DropletIcon, ScaleIcon, PlusIcon, Loader2 } from 'lucide-react';

// Define interfaces for type safety
interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  sub?: string;
  subIcon?: React.ReactNode;
  subClass?: string;
}

interface Submission {
  id: number;
  type: string;
  time: string;
  user: string;
  data: { [key: string]: string };
}

interface DailyFeed {
  date: string;
  feed: number;
}

interface ProductDist {
  label: string;
  value: number;
}

interface YieldHist {
  range: string;
  count: number;
}

interface CpoRefinedOilTrend {
  date: string;
  cpo: number;
  refinedOil: number;
}

interface DeodorizerFractionationTrend {
  date: string;
  deodorizerPower: number;
  fractionationPower: number;
}

interface ChemicalUsageTrend {
  date: string;
  bleachingEarth: number;
  phosphoricAcid: number;
  citricAcid: number;
}

interface TanksTrend {
  date: string;
  tanks: number;
}

// Card component with TypeScript props
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
    {children}
  </div>
);

// Initial data with type annotations
const initialStats: Stat[] = [
  {
    label: 'Total Feed',
    value: '1393.4 MT',
    icon: <DropletIcon size={24} className="text-blue-600" />,
    bg: 'bg-blue-100',
    sub: '+2.5% from last month',
    subIcon: <TrendingUpIcon size={14} className="mr-1" />,
    subClass: 'text-green-600',
  },
  {
    label: 'Refined Oil',
    value: '1331.4 MT',
    icon: <BarChart3Icon size={24} className="text-green-600" />,
    bg: 'bg-green-100',
    sub: '95.5% yield',
    subIcon: <TrendingUpIcon size={14} className="mr-1" />,
    subClass: 'text-green-600',
  },
  {
    label: 'PFAD',
    value: '54.2 MT',
    icon: <ScaleIcon size={24} className="text-amber-600" />,
    bg: 'bg-amber-100',
    sub: '3.9% of total',
    subClass: 'text-gray-600',
  },
  {
    label: 'Olein Production',
    value: '850.5 MT',
    icon: <BarChart3Icon size={24} className="text-purple-600" />,
    bg: 'bg-purple-100',
    sub: '85% of fractionation feed',
    subClass: 'text-gray-600',
  },
];

const initialSubmissions: Submission[] = [
  {
    id: 1,
    type: 'Refinery Form',
    time: '09:30 AM',
    user: 'John Doe',
    data: { feed: '45.2 MT', output: '43.1 MT', yield: '95.4%' },
  },
  {
    id: 2,
    type: 'Stock Form',
    time: '10:15 AM',
    user: 'Jane Smith',
    data: { cpo: '1250 kg', rbd: '1100 kg' },
  },
];

const initialDailyFeed: DailyFeed[] = [
  { date: '2025-05-25', feed: 100 },
  { date: '2025-05-26', feed: 120 },
  { date: '2025-05-27', feed: 110 },
];

const initialProductDist: ProductDist[] = [
  { label: 'Olein', value: 850 },
  { label: 'Stearin', value: 150 },
];

const initialYieldHist: YieldHist[] = [
  { range: '88-90', count: 1 },
  { range: '90-92', count: 3 },
  { range: '92-94', count: 7 },
  { range: '94-96', count: 12 },
  { range: '96-98', count: 6 },
  { range: '98-100', count: 2 },
];

const initialCpoRefinedOilTrend: CpoRefinedOilTrend[] = [
  { date: '2025-05-25', cpo: 100, refinedOil: 90 },
  { date: '2025-05-26', cpo: 120, refinedOil: 110 },
];

const initialDeodorizerFractionationTrend: DeodorizerFractionationTrend[] = [
  { date: '2025-05-25', deodorizerPower: 10, fractionationPower: 8 },
  { date: '2025-05-26', deodorizerPower: 12, fractionationPower: 9 },
];

const initialChemicalUsageTrend: ChemicalUsageTrend[] = [
  { date: '2025-05-25', bleachingEarth: 5, phosphoricAcid: 2, citricAcid: 1 },
  { date: '2025-05-26', bleachingEarth: 6, phosphoricAcid: 2.5, citricAcid: 1.2 },
];

const initialTanksTrend: TanksTrend[] = [
  { date: '2025-05-25', tanks: 10 },
  { date: '2025-05-26', tanks: 11 },
];

// Function to generate dynamic data with realistic variations
const generateDynamicData = <T extends object>(data: T[], variation: number = 0.1): T[] => {
  return data.map(item => ({
    ...item,
    value: 'value' in item ? Math.max(0, (item as any).value * (1 + (Math.random() * variation - variation / 2))) : undefined,
    count: 'count' in item ? Math.max(0, Math.round((item as any).count * (1 + (Math.random() * variation - variation / 2)))) : undefined,
    cpo: 'cpo' in item ? Math.max(0, (item as any).cpo * (1 + (Math.random() * variation - variation / 2))) : undefined,
    refinedOil: 'refinedOil' in item ? Math.max(0, (item as any).refinedOil * (1 + (Math.random() * variation - variation / 2))) : undefined,
    deodorizerPower: 'deodorizerPower' in item ? Math.max(0, (item as any).deodorizerPower * (1 + (Math.random() * variation - variation / 2))) : undefined,
    fractionationPower: 'fractionationPower' in item ? Math.max(0, (item as any).fractionationPower * (1 + (Math.random() * variation - variation / 2))) : undefined,
    bleachingEarth: 'bleachingEarth' in item ? Math.max(0, (item as any).bleachingEarth * (1 + (Math.random() * variation - variation / 2))) : undefined,
    phosphoricAcid: 'phosphoricAcid' in item ? Math.max(0, (item as any).phosphoricAcid * (1 + (Math.random() * variation - variation / 2))) : undefined,
    citricAcid: 'citricAcid' in item ? Math.max(0, (item as any).citricAcid * (1 + (Math.random() * variation - variation / 2))) : undefined,
    tanks: 'tanks' in item ? Math.max(0, Math.round((item as any).tanks * (1 + (Math.random() * variation - variation / 2)))) : undefined,
  }));
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [dailyFeed, setDailyFeed] = useState<DailyFeed[]>(initialDailyFeed);
  const [productDist, setProductDist] = useState<ProductDist[]>(initialProductDist);
  const [yieldHist, setYieldHist] = useState<YieldHist[]>(initialYieldHist);
  const [cpoRefinedOilTrend, setCpoRefinedOilTrend] = useState<CpoRefinedOilTrend[]>(initialCpoRefinedOilTrend);
  const [deodorizerFractionationTrend, setDeodorizerFractionationTrend] = useState<DeodorizerFractionationTrend[]>(initialDeodorizerFractionationTrend);
  const [chemicalUsageTrend, setChemicalUsageTrend] = useState<ChemicalUsageTrend[]>(initialChemicalUsageTrend);
  const [tanksTrend, setTanksTrend] = useState<TanksTrend[]>(initialTanksTrend);
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const colors = ['#2563eb', '#22c55e', '#f59e42', '#a855f7', '#eab308', '#ef4444', '#0ea5e9', '#6366f1'];

  // Periodic data update without alert
  const updateDataPeriodically = () => {
    setDailyFeed(generateDynamicData(dailyFeed));
    setProductDist(generateDynamicData(productDist));
    setYieldHist(generateDynamicData(yieldHist));
    setCpoRefinedOilTrend(generateDynamicData(cpoRefinedOilTrend));
    setDeodorizerFractionationTrend(generateDynamicData(deodorizerFractionationTrend));
    setChemicalUsageTrend(generateDynamicData(chemicalUsageTrend));
    setTanksTrend(generateDynamicData(tanksTrend));
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);

    const interval = setInterval(updateDataPeriodically, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    // Simulate realistic data update for date change
    setDailyFeed(generateDynamicData(initialDailyFeed));
    setProductDist(generateDynamicData(initialProductDist));
    setYieldHist(generateDynamicData(initialYieldHist));
    setCpoRefinedOilTrend(generateDynamicData(initialCpoRefinedOilTrend));
    setDeodorizerFractionationTrend(generateDynamicData(initialDeodorizerFractionationTrend));
    setChemicalUsageTrend(generateDynamicData(initialChemicalUsageTrend));
    setTanksTrend(generateDynamicData(initialTanksTrend));
    setSubmissions(newDate === new Date().toISOString().split('T')[0] ? initialSubmissions : []);
  }, 500);

  const setDaysBack = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const newDate = d.toISOString().split('T')[0];
    setDate(newDate);
    // Update data realistically for date change
    setDailyFeed(generateDynamicData(initialDailyFeed));
    setProductDist(generateDynamicData(initialProductDist));
    setYieldHist(generateDynamicData(initialYieldHist));
    setCpoRefinedOilTrend(generateDynamicData(initialCpoRefinedOilTrend));
    setDeodorizerFractionationTrend(generateDynamicData(initialDeodorizerFractionationTrend));
    setChemicalUsageTrend(generateDynamicData(initialChemicalUsageTrend));
    setTanksTrend(generateDynamicData(initialTanksTrend));
    setSubmissions(newDate === new Date().toISOString().split('T')[0] ? initialSubmissions : []);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">Monitor refinery performance and submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#2C5B48] focus:border-[#2C5B48] transition"
          />
          <button
            className="text-xs px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => setDaysBack(0)}
          >
            Today
          </button>
          <button
            className="text-xs px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => setDaysBack(1)}
          >
            1d back
          </button>
          <button
            className="text-xs px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => setDaysBack(7)}
          >
            7d back
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-4">
            <Loader2 className="animate-spin text-[#2C5B48]" size={24} />
          </div>
        ) : (
          stats.map(stat => (
            <Card key={stat.label} className="flex items-center animate-fade-in hover:shadow-xl transition-shadow">
              <div className={`p-3 rounded-full ${stat.bg} mr-4 animate-pulse-slow`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className={`text-xs flex items-center ${stat.subClass}`}>
                  {stat.subIcon}
                  {stat.sub}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Today's Submissions">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin text-[#2C5B48]" size={24} />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-gray-400">No submissions for this date.</div>
            ) : (
              <ul>
                {submissions.map(sub => (
                  <li key={sub.id} className="p-3 border rounded-md bg-green-50 text-green-900 mb-2 animate-fade-in hover:bg-green-100 transition">
                    <strong>{sub.type.toUpperCase()}:</strong> {sub.type}{' '}
                    <em className="ml-2 text-xs text-gray-500">({sub.time})</em>
                    <div className="text-xs text-gray-700 mt-1">
                      {Object.entries(sub.data).map(([k, v]) => (
                        <span key={k} className="mr-3">
                          {k}: <span className="font-semibold">{v}</span>
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">By {sub.user}</span>
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
                { to: '/refinery-form', title: 'New Refinery Entry', desc: 'Record today’s refinery data' },
                { to: '/stocks', title: 'Update Stock Levels', desc: 'Update current stock readings' },
                { to: '/chemicals', title: 'Chemical Consumption', desc: 'Record chemical usage data' },
                { to: '/fractionation-form', title: 'Fractionation Entry', desc: 'Record fractionation process data' },
                { to: '/mtd-summary', title: 'MTD Summary', desc: 'View month-to-date summary' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block w-full p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
                  aria-label={`Navigate to ${item.title}`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2C5B48] to-[#22c55e] flex items-center justify-center text-white mr-4 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-lg font-bold">{item.title[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <span className="absolute left-0 bottom-0 w-0 h-1 bg-gradient-to-r from-[#2C5B48] to-[#22c55e] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
            <Link
              to="/refinery-form"
              className="fixed lg:absolute right-6 bottom-6 z-20"
              aria-label="Add new entry"
            >
              <span className="relative flex h-12 w-12">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-12 w-12 bg-gradient-to-br from-[#2C5B48] to-[#22c55e] items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                  <PlusIcon size={28} className="text-white" />
                </span>
              </span>
            </Link>
          </Card>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feed Trend Area Chart */}
        <Card title="Feed Trend (MT)">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin text-[#2C5B48]" size={24} />
            </div>
          ) : dailyFeed.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No feed data available for selected date.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyFeed}>
                <defs>
                  <linearGradient id="feedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#374151' }} label={{ value: 'Date', position: 'insideBottom', offset: -5, fill: '#374151' }} />
                <YAxis tick={{ fontSize: 12, fill: '#374151' }} label={{ value: 'Feed (MT)', angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `${value.toFixed(1)} MT`}
                />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="feed"
                  stroke="#2563eb"
                  fill="url(#feedGradient)"
                  fillOpacity={1}
                  animationDuration={1200}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Product Distribution Pie Chart */}
        <Card title="Product Distribution">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin text-[#2C5B48]" size={24} />
            </div>
          ) : productDist.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No product distribution data for selected date.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={productDist}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  onClick={(_, index) => {
                    const segment = productDist[index];
                    if (segment) {
                      window.alert(`Selected: ${segment.label} (${segment.value.toFixed(1)} MT)`);
                    }
                  }}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)} MT`}
                  animationDuration={1000}
                  isAnimationActive={true}
                >
                  {productDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `${value.toFixed(1)} MT`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Yield Histogram Bar Chart */}
        <Card title="Yield Histogram">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yieldHist} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 13, fill: '#374151' }}
                label={{ value: 'Yield Range (%)', position: 'insideBottom', offset: -8, fill: '#374151' }}
              />
              <YAxis
                tick={{ fontSize: 13, fill: '#374151' }}
                label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#2C5B48' }}
                formatter={(value: number) => [`${value} entries`, 'Count']}
              />
              <Legend />
              <Bar
                dataKey="count"
                radius={[12, 12, 0, 0]}
                isAnimationActive={true}
                animationDuration={1200}
              >
                {yieldHist.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#2563eb"
                  fontSize={16}
                  fontWeight={700}
                  formatter={(value: number) => (value > 0 ? value : '')}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-500 mt-2 text-center">
            <span className="inline-block w-3 h-3 rounded-full mr-1 align-middle" style={{ background: colors[0] }} /> Lower yield
            <span className="mx-2">→</span>
            <span className="inline-block w-3 h-3 rounded-full mr-1 align-middle" style={{ background: colors[colors.length - 1] }} /> Higher yield
          </div>
        </Card>
      </div>

      {/* Real Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPO & Refined Oil Trend */}
        <Card title="CPO & Refined Oil Trend">
          {cpoRefinedOilTrend.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No trend data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={cpoRefinedOilTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5, fill: '#374151' }} />
                <YAxis label={{ value: 'Quantity (MT)', angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => value.toFixed(1)}
                />
                <Legend />
                <Line type="monotone" dataKey="cpo" stroke="#2563eb" name="CPO" strokeWidth={2} />
                <Line type="monotone" dataKey="refinedOil" stroke="#22c55e" name="Refined Oil" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Deodorizer & Fractionation Power Trend */}
        <Card title="Deodorizer & Fractionation Power Trend">
          {deodorizerFractionationTrend.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No trend data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={deodorizerFractionationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5, fill: '#374151' }} />
                <YAxis label={{ value: 'Power (MT)', angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => value.toFixed(1)}
                />
                <Legend />
                <Line type="monotone" dataKey="deodorizerPower" stroke="#f59e42" name="Deodorizer Power" strokeWidth={2} />
                <Line type="monotone" dataKey="fractionationPower" stroke="#a855f7" name="Fractionation Power" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Chemical Usage Trend */}
        <Card title="Chemical Usage Trend">
          {chemicalUsageTrend.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No trend data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chemicalUsageTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5, fill: '#374151' }} />
                <YAxis label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => value.toFixed(1)}
                />
                <Legend />
                <Bar dataKey="bleachingEarth" stackId="a" fill="#f59e42" name="Bleaching Earth" radius={[4, 4, 0, 0]} />
                <Bar dataKey="phosphoricAcid" stackId="a" fill="#2563eb" name="Phosphoric Acid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="citricAcid" stackId="a" fill="#22c55e" name="Citric Acid" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Tanks Trend */}
        <Card title="Tanks Trend">
          {tanksTrend.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No trend data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={tanksTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5, fill: '#374151' }} />
                <YAxis label={{ value: 'Tanks Count', angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => value.toFixed(0)}
                />
                <Legend />
                <Line type="monotone" dataKey="tanks" stroke="#eab308" name="Tanks" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Recent Submissions Table */}
      <Card title="Recent Submissions">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed (MT)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output (MT)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-4">No data for this date.</td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id} className="animate-fade-in hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.data.feed || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.data.output || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.data.yield || '-'}</td>
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