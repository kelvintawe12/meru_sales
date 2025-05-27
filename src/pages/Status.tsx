import React, { useEffect, useState } from 'react';

interface DispatchOrder {
  id: string;
  soNumber: string;
  customerName: string;
  date: string;
  status: string;
}

const STATUS_OPTIONS = ['Pending', 'Delivered', 'In Transit', 'Cancelled'];

const sampleOrders: DispatchOrder[] = [
  { id: '1', soNumber: 'SO123', customerName: 'Customer A', date: '2023-06-01', status: 'Pending' },
  { id: '2', soNumber: 'SO124', customerName: 'Customer B', date: '2023-06-02', status: 'Delivered' },
  { id: '3', soNumber: 'SO125', customerName: 'Customer C', date: '2023-06-03', status: 'In Transit' },
];

const Status: React.FC = () => {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate fetching orders from API
    setTimeout(() => {
      setOrders(sampleOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  const handleSave = (id: string) => {
    setSavingIds((prev) => new Set(prev).add(id));
    // Simulate API call to save status
    setTimeout(() => {
      setSavingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      alert(`Status for order ${id} saved.`);
    }, 1000);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Update Dispatch Order Status</h1>
      <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b border-gray-300 text-left">S.O. Number</th>
            <th className="px-4 py-2 border-b border-gray-300 text-left">Customer</th>
            <th className="px-4 py-2 border-b border-gray-300 text-left">Date</th>
            <th className="px-4 py-2 border-b border-gray-300 text-left">Status</th>
            <th className="px-4 py-2 border-b border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(({ id, soNumber, customerName, date, status }) => (
            <tr key={id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b border-gray-300">{soNumber}</td>
              <td className="px-4 py-2 border-b border-gray-300">{customerName}</td>
              <td className="px-4 py-2 border-b border-gray-300">{new Date(date).toLocaleDateString()}</td>
              <td className="px-4 py-2 border-b border-gray-300">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2 border-b border-gray-300">
                <button
                  onClick={() => handleSave(id)}
                  disabled={savingIds.has(id)}
                  className={`px-3 py-1 rounded text-white ${
                    savingIds.has(id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {savingIds.has(id) ? 'Saving...' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-600">
                No dispatch orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Status;
