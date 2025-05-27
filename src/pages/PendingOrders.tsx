import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaPlus, FaTrash, FaCalendarAlt, FaSearch, FaPrint, FaFilePdf, FaFileExport, FaSpinner } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

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

const STATUS_OPTIONS = ['Pending', 'In Transit', 'Cancelled'];

const pendingOrders: React.FC = () => {
  const [reportDate, setReportDate] = useState<Date>(new Date(2025, 4, 26)); // May 26, 2025
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<Omit<PendingOrder, 'id'>>({
    customerName: '',
    date: new Date(),
    soNumber: '',
    status: 'Pending',
    quantities: {
      '20L': 0,
      '10L': 0,
      '5L': 0,
      '3L': 0,
      '1L': 0,
      '250ML': 0,
      '500ML': 0,
    },
    metricTons: 0,
  });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Parse Excel serial date
  const parseExcelDate = (serial: number): Date => {
    if (isNaN(serial)) return new Date();
    return new Date((serial - 25569) * 86400 * 1000);
  };

  // Mock implementation of loadFileData
  const loadFileData = async (): Promise<string> => {
    // TODO: Implement actual file loading logic (e.g., fetch from server)
    return '';
  };

  // Load data from Excel
  useEffect(() => {
    const fetchAndParse = async () => {
      setLoading(true);
      try {
        const csvData = await loadFileData();
        Papa.parse<RawDispatchRow>(csvData, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().replace(/\s+/g, '').replace(/^"|"$/g, ''),
          transform: (value) => (value.trim() === '' ? null : value.trim()),
          complete: (results) => {
            const parsedOrders: PendingOrder[] = results.data
              .filter(
                (row) =>
                  row.DATE &&
                  row.MT &&
                  !isNaN(parseFloat(row.MT)) &&
                  row.TRUCKstatus !== 'Delivered'
              )
              .map((row) => ({
                id: row.INVOICENO || Date.now().toString(),
                customerName: row['CUSTOMER&DEPOTNAME'] || 'Unknown',
                date: parseExcelDate(parseFloat(row.DATE!)),
                soNumber: row.SONO || 'N/A',
                status: (row.TRUCKstatus as 'Pending' | 'In Transit' | 'Cancelled') || 'Pending',
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
              }));
            setOrders(parsedOrders);
            setLoading(false);
          },
          error: () => {
            setError('Failed to load dispatch data');
            setLoading(false);
          },
        });
      } catch {
        setError('Failed to load dispatch data');
        setLoading(false);
      }
    };
    fetchAndParse();
  }, []);

  // Handlers
  const handleAddOrder = () => {
    if (!newOrder.customerName || !newOrder.soNumber) {
      alert('Customer Name and S.O. Number are required');
      return;
    }
    const order: PendingOrder = {
      ...newOrder,
      id: Date.now().toString(),
    };
    setOrders([...orders, order]);
    setNewOrder({
      customerName: '',
      date: new Date(),
      soNumber: '',
      status: 'Pending',
      quantities: {
        '20L': 0,
        '10L': 0,
        '5L': 0,
        '3L': 0,
        '1L': 0,
        '250ML': 0,
        '500ML': 0,
      },
      metricTons: 0,
    });
    setShowAddModal(false);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    setOrders(orders.filter((order) => !selectedOrders.has(order.id)));
    setSelectedOrders(new Set());
  };

  const handleQuantityChange = (id: string, size: keyof PendingOrder['quantities'], value: number) => {
    setOrders(
      orders.map((order) =>
        order.id === id
          ? {
              ...order,
              quantities: {
                ...order.quantities,
                [size]: value,
              },
            }
          : order
      )
    );
  };

  const handleStatusChange = (id: string, status: 'Pending' | 'In Transit' | 'Cancelled') => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  };

  const handleNewQuantityChange = (size: keyof PendingOrder['quantities'], value: number) => {
    setNewOrder({
      ...newOrder,
      quantities: {
        ...newOrder.quantities,
        [size]: value,
      },
    });
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((order) => order.id)));
    }
  };

  const calculateTotal = (size: keyof PendingOrder['quantities']) => {
    return filteredOrders.reduce((sum, order) => sum + order.quantities[size], 0);
  };

  const calculateGrandTotalMT = () => {
    return filteredOrders.reduce((sum, order) => sum + order.metricTons, 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('OIL PENDING ORDERS', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`As on: ${reportDate.toLocaleDateString('en-GB')}`, 20, 30);
    doc.text('Meru Sales Ltd.', 20, 40);

    // @ts-ignore
    doc.autoTable({
      startY: 50,
      head: [['Customer', 'Date', 'S.O.', 'Status', '20L', '10L', '5L', '3L', '1L', '250ML', '500ML', 'MT']],
      body: filteredOrders.map((order) => [
        order.customerName,
        order.date.toLocaleDateString('en-GB'),
        order.soNumber,
        order.status,
        order.quantities['20L'],
        order.quantities['10L'],
        order.quantities['5L'],
        order.quantities['3L'],
        order.quantities['1L'],
        order.quantities['250ML'],
        order.quantities['500ML'],
        order.metricTons.toFixed(2),
      ]),
      foot: [
        [
          'TOTAL',
          '',
          '',
          '',
          calculateTotal('20L'),
          calculateTotal('10L'),
          calculateTotal('5L'),
          calculateTotal('3L'),
          calculateTotal('1L'),
          calculateTotal('250ML'),
          calculateTotal('500ML'),
          calculateGrandTotalMT().toFixed(2),
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });

    doc.save('PendingOrders.pdf');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Customer,Date,S.O. Number,Status,20L,10L,5L,3L,1L,250ML,500ML,Metric Tons']
        .concat(
          filteredOrders.map(
            (o) =>
              `${o.customerName},${o.date.toLocaleDateString('en-GB')},${o.soNumber},${o.status},${
                o.quantities['20L']
              },${o.quantities['10L']},${o.quantities['5L']},${o.quantities['3L']},${o.quantities['1L']},${
                o.quantities['250ML']
              },${o.quantities['500ML']},${o.metricTons.toFixed(2)}`
          ),
          [
            `TOTAL,,,,${
              calculateTotal('20L')
            },${calculateTotal('10L')},${calculateTotal('5L')},${calculateTotal('3L')},${calculateTotal('1L')},${calculateTotal('250ML')},${calculateTotal('500ML')},${calculateGrandTotalMT().toFixed(2)}`
          ]
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pending_orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => order.date <= reportDate)
      .filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.soNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [orders, reportDate, searchTerm]);

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-blue-600" size={24} />
        <span className="ml-2 text-gray-600 font-medium">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-500 font-medium">Error: {error}</div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-gray-800">Oil Pending Orders</h2>
            <p className="text-gray-600 text-sm">Manage and track pending oil dispatch orders</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <DatePicker
                selected={reportDate}
                onChange={(date: Date | null) => {
                  if (date) setReportDate(date);
                }}
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              <FaPrint size={16} />
              <span>Print</span>
            </button>
            <button
              onClick={generatePDF}
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

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by customer or S.O..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <div className="flex items-center gap-2">
            {selectedOrders.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                <FaTrash size={16} />
                <span>Delete Selected ({selectedOrders.size})</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              <FaPlus size={16} />
              <span>Add New Order</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <Card title="Pending Orders">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">S.O. No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">20L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">10L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">5L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">3L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">1L</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">250ML</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">500ML</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">MT</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center text-gray-600 py-4">
                        No pending orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{order.date.toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{order.soNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as 'Pending' | 'In Transit' | 'Cancelled')}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        {(['20L', '10L', '5L', '3L', '1L', '250ML', '500ML'] as Array<keyof PendingOrder['quantities']>).map((size) => (
                          <td key={size} className="px-6 py-4 text-center text-sm text-gray-800">
                            <input
                              type="number"
                              min="0"
                              value={order.quantities[size]}
                              onChange={(e) => handleQuantityChange(order.id, size, parseInt(e.target.value) || 0)}
                              className="w-16 text-center border border-gray-300 rounded-md py-1 text-sm focus:ring-blue-600 focus:border-blue-600"
                            />
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center text-sm text-gray-800">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={order.metricTons}
                            onChange={(e) =>
                              setOrders(
                                orders.map((o) =>
                                  o.id === order.id ? { ...o, metricTons: parseFloat(e.target.value) || 0 } : o
                                )
                              )
                            }
                            className="w-16 text-center border border-gray-300 rounded-md py-1 text-sm focus:ring-blue-600 focus:border-blue-600"
                          />
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-800 transition-all duration-200"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
                {filteredOrders.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-6 py-4" colSpan={5}>TOTAL</td>
                    {(['20L', '10L', '5L', '3L', '1L', '250ML', '500ML'] as Array<keyof PendingOrder['quantities']>).map((size) => (
                      <td key={size} className="px-6 py-4 text-center text-sm text-gray-800">
                        {calculateTotal(size)}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{calculateGrandTotalMT().toFixed(2)}</td>
                    <td className="px-6 py-4"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add New Order Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Add New Pending Order</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-600 hover:text-gray-800 transition-all duration-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <DatePicker
                        selected={newOrder.date}
                        onChange={(date: Date | null) => {
                          if (date) setNewOrder({ ...newOrder, date });
                        }}
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      />
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">S.O. Number *</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      value={newOrder.soNumber}
                      onChange={(e) => setNewOrder({ ...newOrder, soNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newOrder.status}
                      onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as 'Pending' | 'In Transit' | 'Cancelled' })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(['20L', '10L', '5L', '3L', '1L', '250ML', '500ML'] as Array<keyof PendingOrder['quantities']>).map((size) => (
                    <div key={size}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{size}</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                        value={newOrder.quantities[size]}
                        onChange={(e) => handleNewQuantityChange(size, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric Tons (MT)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      value={newOrder.metricTons}
                      onChange={(e) => setNewOrder({ ...newOrder, metricTons: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddOrder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
                  >
                    Add Order
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default pendingOrders;