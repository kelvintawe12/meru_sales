
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaSort,
  FaDownload,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaTimes,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SalesMember {
  id: number;
  name: string;
  email: string;
  progress: number; // percentage 0-100
  salesTarget: number; // in dollars
  dealsClosed: number;
  performanceHistory: { date: string; progress: number }[];
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

const initialMembers: SalesMember[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    progress: 75,
    salesTarget: 100000,
    dealsClosed: 25,
    performanceHistory: [
      { date: '2025-05-01', progress: 60 },
      { date: '2025-05-15', progress: 70 },
      { date: '2025-05-28', progress: 75 },
    ],
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    progress: 50,
    salesTarget: 80000,
    dealsClosed: 15,
    performanceHistory: [
      { date: '2025-05-01', progress: 40 },
      { date: '2025-05-15', progress: 45 },
      { date: '2025-05-28', progress: 50 },
    ],
  },
  {
    id: 3,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    progress: 90,
    salesTarget: 120000,
    dealsClosed: 30,
    performanceHistory: [
      { date: '2025-05-01', progress: 80 },
      { date: '2025-05-15', progress: 85 },
      { date: '2025-05-28', progress: 90 },
    ],
  },
];

const SalesTeam: React.FC = () => {
  const [members, setMembers] = useState<SalesMember[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof SalesMember; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });
  const [progressFilter, setProgressFilter] = useState<[number, number]>([0, 100]);
  const [editingMember, setEditingMember] = useState<SalesMember | null>(null);
  const [newMember, setNewMember] = useState<Partial<SalesMember>>({
    name: '',
    email: '',
    progress: 0,
    salesTarget: 0,
    dealsClosed: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<SalesMember | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('salesTeam', JSON.stringify(members));
  }, [members]);

  // Form validation
  const validateForm = (data: Partial<SalesMember>): boolean => {
    if (!data.name?.trim() || !data.email?.trim()) {
      setErrorMessage('Name and Email are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setErrorMessage('Invalid email format');
      return false;
    }
    if (data.progress && (data.progress < 0 || data.progress > 100)) {
      setErrorMessage('Progress must be between 0 and 100');
      return false;
    }
    if (data.salesTarget && data.salesTarget < 0) {
      setErrorMessage('Sales target cannot be negative');
      return false;
    }
    if (data.dealsClosed && data.dealsClosed < 0) {
      setErrorMessage('Deals closed cannot be negative');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Add new member
  const handleAddMember = () => {
    if (!validateForm(newMember)) return;
    const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
    const newMemberData: SalesMember = {
      id: newId,
      name: newMember.name!,
      email: newMember.email!,
      progress: newMember.progress || 0,
      salesTarget: newMember.salesTarget || 0,
      dealsClosed: newMember.dealsClosed || 0,
      performanceHistory: [{ date: new Date().toISOString().split('T')[0], progress: newMember.progress || 0 }],
    };
    setMembers([...members, newMemberData]);
    setNewMember({ name: '', email: '', progress: 0, salesTarget: 0, dealsClosed: 0 });
    toast.success('Member added successfully!');
  };

  // Edit member
  const handleSaveEdit = () => {
    if (editingMember && validateForm(editingMember)) {
      const updatedHistory = [
        ...editingMember.performanceHistory,
        { date: new Date().toISOString().split('T')[0], progress: editingMember.progress },
      ];
      setMembers(
        members.map(m =>
          m.id === editingMember.id ? { ...editingMember, performanceHistory: updatedHistory } : m
        )
      );
      setEditingMember(null);
      toast.success('Member updated successfully!');
    }
  };

  // Delete member
  const handleDeleteMember = () => {
    if (showDeleteConfirm !== null) {
      setMembers(members.filter(m => m.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      toast.success('Member deleted successfully!');
    }
  };

  // Sorting
  const handleSort = (key: keyof SalesMember) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Filtering
  const filteredMembers = members
    .filter(m =>
      (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      m.progress >= progressFilter[0] &&
      m.progress <= progressFilter[1]
    )
    .sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return sortConfig.direction === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

  // Export to CSV
  const handleExport = () => {
    const csvRows = [
      ['ID', 'Name', 'Email', 'Progress (%)', 'Sales Target ($)', 'Deals Closed'],
      ...filteredMembers.map(m => [
        m.id,
        m.name,
        m.email,
        m.progress,
        m.salesTarget,
        m.dealsClosed,
      ]),
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales_team.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported successfully!');
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              Sales Team Dashboard
            </h2>
            <p className="text-gray-600 text-sm">Track and manage team performance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 flex items-center gap-2"
            >
              <FaDownload />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaChartLine className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <h3 className="text-2xl font-bold text-gray-800">{members.length}</h3>
            </div>
          </Card>
          <Card className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FaChartLine className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Progress</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {members.length > 0
                  ? Math.round(members.reduce((sum, m) => sum + m.progress, 0) / members.length)
                  : 0}
                %
              </h3>
            </div>
          </Card>
          <Card className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <FaChartLine className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales Target</p>
              <h3 className="text-2xl font-bold text-gray-800">
                ${formatNumber(members.reduce((sum, m) => sum + m.salesTarget, 0))}
              </h3>
            </div>
          </Card>
          <Card className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <FaChartLine className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Deals Closed</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {members.reduce((sum, m) => sum + m.dealsClosed, 0)}
              </h3>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card title="Filters">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressFilter[0]}
                      onChange={e => setProgressFilter([Number(e.target.value), progressFilter[1]])}
                      className="w-24 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressFilter[1]}
                      onChange={e => setProgressFilter([progressFilter[0], Number(e.target.value)])}
                      className="w-24 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div>
            <Card title="Quick Actions">
              <div className="space-y-4">
                {[
                  { action: () => setEditingMember({ id: 0, name: '', email: '', progress: 0, salesTarget: 0, dealsClosed: 0, performanceHistory: [] }), title: 'Add Member', desc: 'Create a new team member' },
                  { action: handleExport, title: 'Export Data', desc: 'Download team data as CSV' },
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="block w-full p-4 rounded-lg border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all text-left"
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
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Add/Edit Member Form */}
        {editingMember && (
          <Card title={editingMember.id === 0 ? 'Add New Member' : 'Edit Member'}>
            {errorMessage && (
              <div className="mb-4 text-red-600 font-semibold">{errorMessage}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingMember.email}
                  onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editingMember.progress}
                  onChange={e => setEditingMember({ ...editingMember, progress: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Target ($)</label>
                <input
                  type="number"
                  min={0}
                  value={editingMember.salesTarget}
                  onChange={e => setEditingMember({ ...editingMember, salesTarget: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deals Closed</label>
                <input
                  type="number"
                  min={0}
                  value={editingMember.dealsClosed}
                  onChange={e => setEditingMember({ ...editingMember, dealsClosed: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={editingMember.id === 0 ? handleAddMember : handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
              >
                {editingMember.id === 0 ? 'Add Member' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditingMember(null);
                  setErrorMessage('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </Card>
        )}

        {/* Members Table */}
        <Card title="Team Members">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'progress', label: 'Progress (%)' },
                    { key: 'salesTarget', label: 'Sales Target ($)' },
                    { key: 'dealsClosed', label: 'Deals Closed' },
                    { key: 'actions', label: 'Actions' },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer"
                      onClick={() => key !== 'actions' && handleSort(key as keyof SalesMember)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig.key === key && (
                          <FaSort className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                        No team members found.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map(member => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800">{member.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{member.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${member.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">${formatNumber(member.salesTarget)}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{member.dealsClosed}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 flex gap-2">
                          <button
                            onClick={() => setShowDetailModal(member)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <FaChartLine />
                          </button>
                          <button
                            onClick={() => setEditingMember(member)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(member.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6"
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h4>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this member?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDeleteMember}
                  className="px-6 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Member Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg max-w-3xl w-full m-4 p-6 relative"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                onClick={() => setShowDetailModal(null)}
              >
                <FaTimes size={20} />
              </button>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{showDetailModal.name}'s Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Personal Details">
                  <p><strong>Name:</strong> {showDetailModal.name}</p>
                  <p><strong>Email:</strong> {showDetailModal.email}</p>
                </Card>
                <Card title="Performance Metrics">
                  <p><strong>Progress:</strong> {showDetailModal.progress}%</p>
                  <p><strong>Sales Target:</strong> ${formatNumber(showDetailModal.salesTarget)}</p>
                  <p><strong>Deals Closed:</strong> {showDetailModal.dealsClosed}</p>
                </Card>
                <Card title="Performance History" className="md:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Progress (%)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {showDetailModal.performanceHistory.map((entry, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-800">{entry.date}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{entry.progress}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingMember(showDetailModal);
                    setShowDetailModal(null);
                  }}
                  className="px-6 py-2 rounded-lg font-semibold bg-yellow-600 text-white hover:bg-yellow-700 transition-all duration-200"
                >
                  Edit Member
                </button>
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Utility function for formatting numbers
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export default SalesTeam;