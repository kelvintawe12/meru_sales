import React, { useEffect, useState, useMemo } from 'react';
import { FaSpinner, FaHistory, FaSave, FaSearch, FaFileExport } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

interface DispatchOrder {
  id: string;
  soNumber: string;
  customerName: string;
  date: string;
  status: string;
  history: { date: string; status: string }[];
}

const STATUS_OPTIONS = ['Pending', 'Delivered', 'In Transit', 'Cancelled'];

const sampleOrders: DispatchOrder[] = [
  {
    id: '1',
    soNumber: 'SO123',
    customerName: 'Customer A',
    date: '2023-06-01',
    status: 'Pending',
    history: [{ date: '2023-05-30', status: 'Pending' }],
  },
  {
    id: '2',
    soNumber: 'SO124',
    customerName: 'Customer B',
    date: '2023-06-02',
    status: 'Delivered',
    history: [
      { date: '2023-05-31', status: 'In Transit' },
      { date: '2023-06-01', status: 'Delivered' },
    ],
  },
  {
    id: '3',
    soNumber: 'SO125',
    customerName: 'Customer C',
    date: '2023-06-03',
    status: 'In Transit',
    history: [
      { date: '2023-06-01', status: 'Pending' },
      { date: '2023-06-02', status: 'In Transit' },
    ],
  },
];

const PAGE_SIZE = 5;

// Card component to match Dashboard style
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

const Status: React.FC = () => {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<keyof DispatchOrder>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setOrders(sampleOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status: newStatus,
              history: [...order.history, { date: new Date().toISOString(), status: newStatus }],
            }
          : order
      )
    );
  };

  const handleSave = (id: string) => {
    setSavingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setSavingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      alert(`Status for order ${id} saved.`);
    }, 1000);
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      if (sortKey === 'date') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        if (aDate < bDate) return sortOrder === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedOrders.length / PAGE_SIZE);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeSort = (key: keyof DispatchOrder) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  if (sortKey === 'history') {
    setSortKey('date');
  }

  const openHistoryModal = (order: DispatchOrder) => {
    setSelectedOrder(order);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setSelectedOrder(null);
    setShowHistoryModal(false);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['S.O. Number,Customer,Date,Status']
        .concat(
          sortedOrders.map(
            (o) =>
              `${o.soNumber},${o.customerName},${new Date(o.date).toLocaleDateString()},${o.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dispatch_orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-blue-600" size={24} />
        <span className="ml-2 text-gray-600 font-medium">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Update Dispatch Order Status</h2>
            <p className="text-gray-600 text-sm">Manage and update dispatch order statuses</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by S.O. Number, Customer, or Status"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-600 focus:border-blue-600 w-full md:w-64 transition-all duration-200"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              <FaFileExport size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <Card title="Dispatch Orders" className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    { key: 'soNumber', label: 'S.O. No' },
                    { key: 'customerName', label: 'Customer' },
                    { key: 'date', label: 'Date' },
                    { key: 'status', label: 'Status' },
                    { key: null, label: 'Actions' },
                  ].map((header) => (
                    <th
                      key={header.label}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${
                        header.key ? 'cursor-pointer hover:text-gray-800' : ''
                      }`}
                      onClick={() => header.key && changeSort(header.key as keyof DispatchOrder)}
                    >
                      <div className="flex items-center gap-1">
                        {header.label}
                        {header.key && sortKey === header.key && (
                          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-600 py-4">
                        No dispatch orders found.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800">{order.soNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {new Date(order.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 flex gap-2">
                          <button
                            onClick={() => handleSave(order.id)}
                            disabled={savingIds.has(order.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
                              savingIds.has(order.id)
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <FaSave size={14} />
                            <span>{savingIds.has(order.id) ? 'Saving...' : 'Save'}</span>
                          </button>
                          <button
                            onClick={() => openHistoryModal(order)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-200"
                          >
                            <FaHistory size={14} />
                            <span>History</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition-all duration-200"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition-all duration-200"
            >
              Next
            </button>
          </div>
        </Card>

        {/* History Modal */}
        <AnimatePresence>
          {showHistoryModal && selectedOrder && (
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
                className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Status History for {selectedOrder.soNumber}
                </h2>
                <ul className="space-y-3">
                  {selectedOrder.history
                    .slice()
                    .reverse()
                    .map(({ date, status }, index) => (
                      <li
                        key={index}
                        className="pb-2 border-b border-gray-200 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium text-gray-700">
                            {new Date(date).toLocaleString('en-GB')}:
                          </span>{' '}
                          {status}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : status === 'In Transit'
                              ? 'bg-blue-100 text-blue-800'
                              : status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {status}
                        </span>
                      </li>
                    ))}
                </ul>
                <button
                  onClick={closeHistoryModal}
                  className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Status;