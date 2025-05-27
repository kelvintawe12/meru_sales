import React, { useState, useMemo } from 'react';
import { FaCalendarAlt, FaSearch, FaFileExport, FaFilePdf, FaTruck, FaBox, FaRoad } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

// Interfaces (synthesized from previous components)
interface DispatchOrder {
  id: string;
  soNumber: string;
  customerName: string;
  date: string;
  status: 'Pending' | 'Delivered' | 'In Transit' | 'Cancelled';
}

interface Truck {
  id: string;
  number: string;
  type: 'small' | 'big';
}

interface TripRecord {
  id: string;
  truckId: string;
  date: Date;
  driverName: string;
  destination: string;
  tripCount: number;
  notes: string;
}

interface PendingOrder {
  id: string;
  customerName: string;
  date: Date;
  soNumber: string;
  status: 'Pending' | 'In Transit' | 'Cancelled';
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

// Mock data (replace with actual data fetching logic)
const mockDispatchOrders: DispatchOrder[] = [
  { id: '1', soNumber: 'SO123', customerName: 'Customer A', date: '2025-05-01', status: 'Pending' },
  { id: '2', soNumber: 'SO124', customerName: 'Customer B', date: '2025-05-10', status: 'Delivered' },
  { id: '3', soNumber: 'SO125', customerName: 'Customer C', date: '2025-05-15', status: 'In Transit' },
];

const mockTrucks: Truck[] = [
  { id: '1', number: 'RAG 490 S', type: 'small' },
  { id: '2', number: 'RAE510 P', type: 'big' },
];

const mockTripRecords: TripRecord[] = [
  {
    id: '1',
    truckId: '1',
    date: new Date('2025-05-05'),
    driverName: 'John Doe',
    destination: 'Nairobi',
    tripCount: 2,
    notes: '',
  },
  {
    id: '2',
    truckId: '2',
    date: new Date('2025-05-12'),
    driverName: 'Jane Smith',
    destination: 'Mombasa',
    tripCount: 1,
    notes: '',
  },
];

const mockPendingOrders: PendingOrder[] = [
  {
    id: '1',
    customerName: 'Customer A',
    date: new Date('2025-05-03'),
    soNumber: 'SO126',
    status: 'Pending',
    quantities: { '20L': 100, '10L': 50, '5L': 20, '3L': 10, '1L': 5, '250ML': 2, '500ML': 3 },
    metricTons: 1.5,
  },
  {
    id: '2',
    customerName: 'Customer B',
    date: new Date('2025-05-20'),
    soNumber: 'SO127',
    status: 'In Transit',
    quantities: { '20L': 200, '10L': 100, '5L': 40, '3L': 20, '1L': 10, '250ML': 4, '500ML': 6 },
    metricTons: 3.0,
  },
];

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

const MTDSummary: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 4, 1)); // May 1, 2025
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 4, 28)); // May 28, 2025
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter data for the selected date range
  const filteredDispatchOrders = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockDispatchOrders.filter((order) => {
      const orderDate = new Date(order.date);
      return (
        orderDate >= start &&
        orderDate <= end &&
        (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.soNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [startDate, endDate, searchTerm]);

  const filteredTripRecords = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockTripRecords.filter((record) => {
      return (
        record.date >= start &&
        record.date <= end &&
        (mockTrucks
          .find((t) => t.id === record.truckId)
          ?.number.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          record.driverName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [startDate, endDate, searchTerm]);

  const filteredPendingOrders = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockPendingOrders.filter((order) => {
      return (
        order.date >= start &&
        order.date <= end &&
        (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.soNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [startDate, endDate, searchTerm]);

  // Calculate summaries
  const orderStatusCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      InTransit: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    filteredDispatchOrders.forEach((order) => {
      if (order.status === 'Pending') counts.Pending++;
      else if (order.status === 'In Transit') counts.InTransit++;
      else if (order.status === 'Delivered') counts.Delivered++;
      else if (order.status === 'Cancelled') counts.Cancelled++;
    });
    filteredPendingOrders.forEach((order) => {
      if (order.status === 'Pending') counts.Pending++;
      else if (order.status === 'In Transit') counts.InTransit++;
      else if (order.status === 'Cancelled') counts.Cancelled++;
    });
    return counts;
  }, [filteredDispatchOrders, filteredPendingOrders]);

  const tripCounts = useMemo(() => {
    const counts = {
      small: 0,
      big: 0,
      total: 0,
    };
    filteredTripRecords.forEach((record) => {
      const truck = mockTrucks.find((t) => t.id === record.truckId);
      if (truck) {
        counts.total += record.tripCount;
        if (truck.type === 'small') counts.small += record.tripCount;
        else counts.big += record.tripCount;
      }
    });
    return counts;
  }, [filteredTripRecords]);

  const quantityTotals = useMemo(() => {
    const totals = {
      '20L': 0,
      '10L': 0,
      '5L': 0,
      '3L': 0,
      '1L': 0,
      '250ML': 0,
      '500ML': 0,
      metricTons: 0,
    };
    filteredPendingOrders.forEach((order) => {
      totals['20L'] += order.quantities['20L'];
      totals['10L'] += order.quantities['10L'];
      totals['5L'] += order.quantities['5L'];
      totals['3L'] += order.quantities['3L'];
      totals['1L'] += order.quantities['1L'];
      totals['250ML'] += order.quantities['250ML'];
      totals['500ML'] += order.quantities['500ML'];
      totals.metricTons += order.metricTons;
    });
    return totals;
  }, [filteredPendingOrders]);

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Category,Metric,Value',
        'Orders,Total Orders,' + (filteredDispatchOrders.length + filteredPendingOrders.length),
        'Orders,Pending,' + orderStatusCounts.Pending,
        'Orders,In Transit,' + orderStatusCounts.InTransit,
        'Orders,Delivered,' + orderStatusCounts.Delivered,
        'Orders,Cancelled,' + orderStatusCounts.Cancelled,
        'Trips,Total Trips,' + tripCounts.total,
        'Trips,Small Truck Trips,' + tripCounts.small,
        'Trips,Big Truck Trips,' + tripCounts.big,
        'Quantities,20L,' + quantityTotals['20L'],
        'Quantities,10L,' + quantityTotals['10L'],
        'Quantities,5L,' + quantityTotals['5L'],
        'Quantities,3L,' + quantityTotals['3L'],
        'Quantities,1L,' + quantityTotals['1L'],
        'Quantities,250ML,' + quantityTotals['250ML'],
        'Quantities,500ML,' + quantityTotals['500ML'],
        'Quantities,Metric Tons,' + quantityTotals.metricTons.toFixed(2),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'mtd_summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('MONTH-TO-DATE SUMMARY', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Period: ${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`, 20, 30);
    doc.text('Meru Sales Ltd.', 20, 40);

    // Summary Table
    // @ts-ignore
    doc.autoTable({
      startY: 50,
      head: [['Category', 'Metric', 'Value']],
      body: [
        ['Orders', 'Total Orders', filteredDispatchOrders.length + filteredPendingOrders.length],
        ['Orders', 'Pending', orderStatusCounts.Pending],
        ['Orders', 'In Transit', orderStatusCounts.InTransit],
        ['Orders', 'Delivered', orderStatusCounts.Delivered],
        ['Orders', 'Cancelled', orderStatusCounts.Cancelled],
        ['Trips', 'Total Trips', tripCounts.total],
        ['Trips', 'Small Truck Trips', tripCounts.small],
        ['Trips', 'Big Truck Trips', tripCounts.big],
        ['Quantities', '20L', quantityTotals['20L']],
        ['Quantities', '10L', quantityTotals['10L']],
        ['Quantities', '5L', quantityTotals['5L']],
        ['Quantities', '3L', quantityTotals['3L']],
        ['Quantities', '1L', quantityTotals['1L']],
        ['Quantities', '250ML', quantityTotals['250ML']],
        ['Quantities', '500ML', quantityTotals['500ML']],
        ['Quantities', 'Metric Tons', quantityTotals.metricTons.toFixed(2)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });

    doc.save('MTD_Summary.pdf');
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Month-to-Date Summary</h2>
            <p className="text-gray-600 text-sm">Overview of orders, trips, and quantities for May 2025</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => {
                  if (date) setStartDate(date);
                }}
                dateFormat="dd/MM/yyyy"
                maxDate={endDate}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => {
                  if (date) setEndDate(date);
                }}
                dateFormat="dd/MM/yyyy"
                minDate={startDate}
                maxDate={new Date()}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
            >
              <FaFilePdf size={16} />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              <FaFileExport size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by customer, S.O., truck, or driver..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaBox className="text-blue-600" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Orders</h4>
              <p className="text-2xl font-bold text-gray-800">{filteredDispatchOrders.length + filteredPendingOrders.length}</p>
              <p className="text-xs text-gray-500">
                Pending: {orderStatusCounts.Pending} | In Transit: {orderStatusCounts.InTransit}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FaTruck className="text-green-600" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Trips</h4>
              <p className="text-2xl font-bold text-gray-800">{tripCounts.total}</p>
              <p className="text-xs text-gray-500">
                Small Trucks: {tripCounts.small} | Big Trucks: {tripCounts.big}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaRoad className="text-yellow-600" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Metric Tons</h4>
              <p className="text-2xl font-bold text-gray-800">{quantityTotals.metricTons.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                20L: {quantityTotals['20L']} | 10L: {quantityTotals['10L']}
              </p>
            </div>
          </Card>
        </div>

        {/* Detailed Summary Tables */}
        <Card title="Order Summary">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">S.O. No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {[...filteredDispatchOrders, ...filteredPendingOrders].length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-600 py-4">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    [...filteredDispatchOrders, ...filteredPendingOrders].map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{order.soNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{new Date(order.date).toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'In Transit'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'Delivered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Trip Summary">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Truck</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Trips</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredTripRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-600 py-4">
                        No trips found.
                      </td>
                    </tr>
                  ) : (
                    filteredTripRecords.map((record) => {
                      const truck = mockTrucks.find((t) => t.id === record.truckId);
                      return (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-gray-800">{truck?.number || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{truck?.type || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{record.driverName}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{record.date.toLocaleDateString('en-GB')}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-800">{record.tripCount}</td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Quantity Summary">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">S.O. No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">20L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">10L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">5L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">3L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">1L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">250ML</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">500ML</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">MT</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredPendingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center text-gray-600 py-4">
                        No pending orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredPendingOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{order.soNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{order.date.toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.quantities['20L']}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.quantities['10L']}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.quantities['5L']}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.quantities['3L']}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.quantities['1L']}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.quantities['250ML']}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.quantities['500ML']}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{order.metricTons.toFixed(2)}</td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
                {filteredPendingOrders.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-6 py-4 text-sm text-gray-800" colSpan={3}>TOTAL</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals['20L']}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals['10L']}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals['5L']}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals['3L']}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals['1L']}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals['250ML']}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals['500ML']}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{quantityTotals.metricTons.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default MTDSummary;
