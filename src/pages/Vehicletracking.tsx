import React, { useState } from 'react';
import { FaTruck, FaCalendarAlt, FaSearch, FaPrint, FaFileExport, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const VehicleTrackingForm: React.FC = () => {
  const trucks: Truck[] = [
    { id: '1', number: 'RAG 490 S', type: 'small' },
    { id: '2', number: 'RAG 499 S', type: 'small' },
    { id: '3', number: 'RAG 491 S', type: 'small' },
    { id: '4', number: 'RAG 209 S', type: 'small' },
    { id: '5', number: 'RAG 211 S', type: 'small' },
    { id: '6', number: 'RAG 214 S', type: 'small' },
    { id: '7', number: 'RAG 651 S', type: 'small' },
    { id: '8', number: 'RAG 212 S', type: 'small' },
    { id: '9', number: 'RAG 207 S', type: 'small' },
    { id: '10', number: 'RAG 208 S', type: 'small' },
    { id: '11', number: 'RAG 498 S', type: 'small' },
    { id: '12', number: 'RAG 216 S', type: 'small' },
    { id: '13', number: 'RAG 661 S', type: 'small' },
    { id: '14', number: 'RAG 213 S', type: 'small' },
    { id: '15', number: 'RAG 215 S', type: 'small' },
    { id: '16', number: 'RAG 494 S', type: 'small' },
    { id: '17', number: 'RAG 492 S', type: 'small' },
    { id: '18', number: 'RAG 204 S', type: 'small' },
    { id: '19', number: 'RAE510 P', type: 'big' },
    { id: '20', number: 'RAC063F', type: 'big' },
    { id: '21', number: 'RAF312P', type: 'big' },
    { id: '22', number: 'RAF303P', type: 'big' },
    { id: '23', number: 'RAF317P', type: 'big' },
    { id: '24', number: 'RAF 305P', type: 'big' },
    { id: '25', number: 'RAE 504 P/ RAF313P', type: 'big' },
    { id: '26', number: 'RAF 073 L', type: 'big' },
    { id: '27', number: 'RAF316P', type: 'big' },
  ];

  const [tripRecords, setTripRecords] = useState<TripRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [newRecord, setNewRecord] = useState<Omit<TripRecord, 'id'>>({
    truckId: '',
    date: new Date(),
    driverName: '',
    destination: '',
    tripCount: 1,
    notes: '',
  });
  const [activeTab, setActiveTab] = useState<'all' | 'small' | 'big'>('all');

  const handleAddRecord = () => {
    if (!newRecord.truckId || !newRecord.driverName) {
      alert('Please select a truck and enter driver name');
      return;
    }

    const record: TripRecord = {
      ...newRecord,
      id: Date.now().toString(),
    };

    setTripRecords([...tripRecords, record]);
    setNewRecord({
      truckId: '',
      date: new Date(),
      driverName: '',
      destination: '',
      tripCount: 1,
      notes: '',
    });
  };

  const handleDeleteRecord = (id: string) => {
    setTripRecords(tripRecords.filter((record) => record.id !== id));
  };

  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch = truck.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || truck.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const filteredRecords = tripRecords.filter((record) => {
    const truck = trucks.find((t) => t.id === record.truckId);
    return truck && truck.number.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const calculateWeeklyTrips = (truckId: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return tripRecords
      .filter((record) => record.truckId === truckId && record.date >= oneWeekAgo)
      .reduce((sum, record) => sum + record.tripCount, 0);
  };

  const calculateTotalWeeklyTrips = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return tripRecords
      .filter((record) => record.date >= oneWeekAgo)
      .reduce((sum, record) => sum + record.tripCount, 0);
  };

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
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaTruck className="mr-2 text-blue-600" />
              Vehicle Tracking System
            </h2>
            <p className="text-gray-600 text-sm">Manage and track truck trips</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  if (date) setSelectedDate(date);
                }}
                dateFormat="dd/MM/yyyy"
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                maxDate={new Date()}
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              <FaPrint size={16} />
              <span>Print</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
            >
              <FaFileExport size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {['all', 'small', 'big'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab(tab as 'all' | 'small' | 'big')}
            >
              {tab === 'all' ? 'All Trucks' : tab === 'small' ? 'Small Trucks' : 'Big Trucks'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by truck number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        {/* Truck List and Trip Records */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Truck List */}
          <Card title="Available Trucks" className="lg:col-span-1">
            <div className="max-h-96 overflow-y-auto space-y-2">
              <AnimatePresence>
                {filteredTrucks.length > 0 ? (
                  filteredTrucks.map((truck) => (
                    <motion.div
                      key={truck.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                        newRecord.truckId === truck.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setNewRecord({ ...newRecord, truckId: truck.id })}
                    >
                      <div className="font-medium text-gray-800">{truck.number}</div>
                      <div className="text-sm text-gray-600">
                        {truck.type === 'small' ? 'Small Truck' : 'Big Truck'} | Weekly Trips:{' '}
                        {calculateWeeklyTrips(truck.id)}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No trucks found</div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* Add Trip Form */}
          <Card title="Add Trip Record" className="lg:col-span-1">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selected Truck</label>
                <div className="p-2 bg-white rounded-md border border-gray-300 text-sm text-gray-800">
                  {newRecord.truckId
                    ? trucks.find((t) => t.id === newRecord.truckId)?.number
                    : 'Select a truck from the list'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <DatePicker
                    selected={newRecord.date}
                    onChange={(date: Date | null) => {
                      if (date) setNewRecord({ ...newRecord, date });
                    }}
                    dateFormat="dd/MM/yyyy"
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                    maxDate={new Date()}
                  />
                  <FaCalendarAlt
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  value={newRecord.driverName}
                  onChange={(e) => setNewRecord({ ...newRecord, driverName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  value={newRecord.destination}
                  onChange={(e) => setNewRecord({ ...newRecord, destination: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. of Trips</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  value={newRecord.tripCount}
                  onChange={(e) => setNewRecord({ ...newRecord, tripCount: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  rows={3}
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                />
              </div>

              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
                onClick={handleAddRecord}
              >
                Add Trip Record
              </button>
            </div>
          </Card>

          {/* Trip Records */}
          <Card title="Recent Trip Records" className="lg:col-span-1">
            <div className="max-h-96 overflow-y-auto space-y-2">
              <AnimatePresence>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const truck = trucks.find((t) => t.id === record.truckId);
                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">{truck?.number}</div>
                            <div className="text-sm text-gray-600">
                              {record.date.toLocaleDateString('en-GB')} | {record.driverName}
                            </div>
                            <div className="text-sm text-gray-600">
                              Trips: {record.tripCount} | {record.destination}
                            </div>
                            {record.notes && (
                              <div className="text-sm text-gray-600 mt-1">Notes: {record.notes}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-800 transition-all duration-200"
                            title="Delete record"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-4">No trip records found</div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-800">
              <span className="font-medium">Total Weekly Trips:</span> {calculateTotalWeeklyTrips()}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default VehicleTrackingForm;