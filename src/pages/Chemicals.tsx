
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaPlus, FaTrash, FaCalendarAlt, FaSearch, FaPrint, FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

const Chemicals: React.FC = () => {
  const [reportDate, setReportDate] = useState<Date>(new Date(2025, 4, 26)); // May 26, 2025
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<Omit<PendingOrder, 'id'>>({
    customerName: '',
    date: new Date(),
    soNumber: '',
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

  // Parse Excel serial date
  const parseExcelDate = (serial: number): Date => {
    if (isNaN(serial)) return new Date();
    return new Date((serial - 25569) * 86400 * 1000);
  };

  // Mock implementation of loadFileData; replace with actual file loading logic as needed
  const loadFileData = (): string => {
    // TODO: Implement actual file loading logic here (e.g., fetch from server or local file)
    return '';
  };
  
  // Load data from Excel
  useEffect(() => {
    const csvData = loadFileData();
    Papa.parse<RawDispatchRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/\s+/g, '').replace(/^"|"$/g, ''),
      transform: (value) => (value.trim() === '' ? null : value.trim()),
      complete: (results) => {
        const parsedOrders: PendingOrder[] = results.data
          .filter((row) => row.DATE && row.MT && !isNaN(parseFloat(row.MT)) && row.TRUCKstatus !== 'Delivered')
          .map((row) => ({
            id: row.INVOICENO || Date.now().toString(),
            customerName: row['CUSTOMER&DEPOTNAME'] || 'Unknown',
            date: parseExcelDate(parseFloat(row.DATE!)),
            soNumber: row.SONO || 'N/A',
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
    (document.getElementById('addOrderModal') as HTMLDialogElement)?.close();
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
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

  const handleNewQuantityChange = (size: keyof PendingOrder['quantities'], value: number) => {
    setNewOrder({
      ...newOrder,
      quantities: {
        ...newOrder.quantities,
        [size]: value,
      },
    });
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
    doc.autoTable(doc, {
      startY: 50,
      head: [['Customer', 'Date', 'S.O.', '20L', '10L', '5L', '3L', '1L', '250ML', '500ML', 'MT']],
      body: filteredOrders.map((order) => [
        order.customerName,
        order.date.toLocaleDateString('en-GB'),
        order.soNumber,
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

  const handlePrint = () => {
    window.print();
  };

  // Filter orders
  const filteredOrders = orders
    .filter((order) => order.date <= reportDate)
    .filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.soNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <div className="text-center text-xl p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">OIL PENDING ORDERS</h1>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center">
              <span className="mr-2 text-gray-600">As on:</span>
              <DatePicker
                selected={reportDate}
                onChange={(date: Date | null) => {
                  if (date) setReportDate(date);
                }}
                dateFormat="dd/MM/yyyy"
                className="border rounded p-2"
              />
              <FaCalendarAlt className="ml-2 text-gray-500" />
            </div>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaPrint className="mr-2" /> Print
            </button>
            <button
              onClick={generatePDF}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
          </div>
        </div>

        {/* Search and Add New */}
        <div className="flex flex-col sm:flex-row justify-between mb-6">
          <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
            <input
              type="text"
              placeholder="Search customer or S.O..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => (document.getElementById('addOrderModal') as HTMLDialogElement)?.showModal()}
          >
            <FaPlus className="mr-2" /> Add New Order
          </button>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">CUSTOMER</th>
                <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">DATE</th>
                <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">S.O. NO.</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">20L</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">10L</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">5L</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">3L</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">1L</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">250ML</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">500ML</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">MT</th>
                <th className="py-3 px-4 border-b text-center font-semibold text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{order.customerName}</td>
                  <td className="py-3 px-4 border-b">{order.date.toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-4 border-b">{order.soNumber}</td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      value={order.quantities['20L']}
                      onChange={(e) => handleQuantityChange(order.id, '20L', parseInt(e.target.value) || 0)}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      value={order.quantities['10L']}
                      onChange={(e) => handleQuantityChange(order.id, '10L', parseInt(e.target.value) || 0)}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      value={order.quantities['5L']}
                      onChange={(e) => handleQuantityChange(order.id, '5L', parseInt(e.target.value) || 0)}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      value={order.quantities['3L']}
                      onChange={(e) => handleQuantityChange(order.id, '3L', parseInt(e.target.value) || 0)}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      value={order.quantities['1L']}
                      onChange={(e) => handleQuantityChange(order.id, '1L', parseInt(e.target.value) || 0)}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      value={order.quantities['250ML']}
                      onChange={(e) => handleQuantityChange(order.id, '250ML', parseInt(e.target.value) || 0)}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      value={order.quantities['500ML']}
                      onChange={(e) => handleQuantityChange(order.id, '500ML', parseInt(e.target.value) || 0)}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={order.metricTons}
                      onChange={(e) => {
                        setOrders(
                          orders.map((o) =>
                            o.id === order.id ? { ...o, metricTons: parseFloat(e.target.value) || 0 } : o
                          )
                        );
                      }}
                      className="w-16 text-center border rounded py-1"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="py-3 px-4 border-b" colSpan={3}>
                  TOTAL
                </td>
                <td className="py-3 px-4 border-b text-center">{calculateTotal('20L')}</td>
                <td className="py-3 px-4 border-b text-center">{calculateTotal('10L')}</td>
                <td className="py-3 px-4 border-b text-center">{calculateTotal('5L')}</td>
                <td className="py-3 px-4 border-b text-center">{calculateTotal('3L')}</td>
                <td className="py-3 px-4 border-b text-center">{calculateTotal('1L')}</td>
                <td className="py-3 px-4 border-b text-center">{calculateTotal('250ML')}</td>
                <td className="py-3 px-4 border-b text-center">{calculateTotal('500ML')}</td>
                <td className="py-3 px-4 border-b text-center">{calculateGrandTotalMT().toFixed(2)}</td>
                <td className="py-3 px-4 border-b"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add New Order Modal */}
        <dialog id="addOrderModal" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg mb-6">Add New Pending Order</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <DatePicker
                  selected={newOrder.date}
                  onChange={(date: Date | null) => {
                    if (date) setNewOrder({ ...newOrder, date });
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">S.O. Number *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newOrder.soNumber}
                  onChange={(e) => setNewOrder({ ...newOrder, soNumber: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">20L</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={newOrder.quantities['20L']}
                  onChange={(e) => handleNewQuantityChange('20L', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">10L</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={newOrder.quantities['10L']}
                  onChange={(e) => handleNewQuantityChange('10L', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">5L</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={newOrder.quantities['5L']}
                  onChange={(e) => handleNewQuantityChange('5L', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">3L</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={newOrder.quantities['3L']}
                  onChange={(e) => handleNewQuantityChange('3L', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1L</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={newOrder.quantities['1L']}
                  onChange={(e) => handleNewQuantityChange('1L', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">250ML</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={newOrder.quantities['250ML']}
                  onChange={(e) => handleNewQuantityChange('250ML', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">500ML</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={newOrder.quantities['500ML']}
                  onChange={(e) => handleNewQuantityChange('500ML', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metric Tons (MT)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={newOrder.metricTons}
                  onChange={(e) => setNewOrder({ ...newOrder, metricTons: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn bg-blue-600 text-white" onClick={handleAddOrder}>
                Add Order
              </button>
              <form method="dialog">
                <button className="btn ml-2">Cancel</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default Chemicals;