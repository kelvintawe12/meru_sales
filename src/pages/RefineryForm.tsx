import React, { useState } from 'react';
import { FaTruck, FaCalendarAlt, FaSearch, FaPrint, FaFileExcel } from 'react-icons/fa';
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

const VehicleTrackingForm: React.FC = () => {
  // Initialize trucks data
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
    setTripRecords(tripRecords.filter(record => record.id !== id));
  };

  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || truck.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const filteredRecords = tripRecords.filter(record => {
    const truck = trucks.find(t => t.id === record.truckId);
    return truck && truck.number.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const calculateWeeklyTrips = (truckId: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return tripRecords
      .filter(record => record.truckId === truckId && record.date >= oneWeekAgo)
      .reduce((sum, record) => sum + record.tripCount, 0);
  };

  const calculateTotalWeeklyTrips = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return tripRecords
      .filter(record => record.date >= oneWeekAgo)
      .reduce((sum, record) => sum + record.tripCount, 0);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaTruck className="mr-2 text-blue-600" /> VEHICLE TRACKING SYSTEM
          </h1>
          <div className="flex items-center space-x-4">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border rounded p-2"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
              <FaPrint className="mr-2" /> Print
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center">
              <FaFileExcel className="mr-2" /> Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('all')}
          >
            All Trucks
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'small' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('small')}
          >
            Small Trucks
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'big' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('big')}
          >
            Big Trucks
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search by truck number..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Truck List and Trip Records */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Truck List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Available Trucks</h2>
            <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
              {filteredTrucks.map(truck => (
                <div 
                  key={truck.id} 
                  className={`p-3 mb-2 rounded-lg cursor-pointer ${newRecord.truckId === truck.id ? 'bg-blue-100 border border-blue-300' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
                  onClick={() => setNewRecord({...newRecord, truckId: truck.id})}
                >
                  <div className="font-medium">{truck.number}</div>
                  <div className="text-sm text-gray-600">
                    {truck.type === 'small' ? 'Small Truck' : 'Big Truck'} | 
                    Weekly Trips: {calculateWeeklyTrips(truck.id)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Trip Form */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Add Trip Record</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Selected Truck</label>
                <div className="p-2 bg-white rounded border border-gray-300">
                  {newRecord.truckId ? 
                    trucks.find(t => t.id === newRecord.truckId)?.number : 
                    'Select a truck from the list'}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <DatePicker
                  selected={newRecord.date}
                  onChange={(date: Date) => setNewRecord({...newRecord, date})}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newRecord.driverName}
                  onChange={(e) => setNewRecord({...newRecord, driverName: e.target.value})}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newRecord.destination}
                  onChange={(e) => setNewRecord({...newRecord, destination: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">No. of Trips</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded"
                  value={newRecord.tripCount}
                  onChange={(e) => setNewRecord({...newRecord, tripCount: parseInt(e.target.value) || 1})}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                />
              </div>

              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                onClick={handleAddRecord}
              >
                Add Trip Record
              </button>
            </div>
          </div>

          {/* Trip Records */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Recent Trip Records</h2>
            <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => {
                  const truck = trucks.find(t => t.id === record.truckId);
                  return (
                    <div key={record.id} className="bg-white p-3 mb-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{truck?.number}</div>
                          <div className="text-sm text-gray-600">
                            {record.date.toLocaleDateString()} | {record.driverName}
                          </div>
                          <div className="text-sm">Trips: {record.tripCount} | {record.destination}</div>
                          {record.notes && (
                            <div className="text-sm mt-1 text-gray-600">Notes: {record.notes}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete record"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">No trip records found</div>
              )}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="font-medium">Total Weekly Trips: {calculateTotalWeeklyTrips()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTrackingForm;