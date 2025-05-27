import React, { useState } from 'react';

// Define TypeScript interfaces for data structures
interface Quantities {
  [key: string]: number;
}

interface OilData {
  date: string;
  sNo: number;
  sONo: string;
  ticketNo: string;
  invoiceNo: string;
  truckNo: string;
  driverNo: string;
  transporter: string;
  dispatchTo: string;
  customerDepotName: string;
  quantities: Quantities;
  truckStatus: string;
  gatePassNo: string;
}

interface ChippyData {
  date: string;
  mobileNo: string;
  sONo: string;
  ebm: string;
  ticketNo: string;
  truckNo: string;
  dispatchTo: string;
  transporter: string;
  nameOfParty: string;
  quantities: Quantities;
  truckStatus: string;
  gatePassNo: string;
}

interface SoapData {
  date: string;
  sNo: number;
  ebm: string;
  ticketNo: string;
  sONo: string;
  truckNo: string;
  driverNo: string;
  transporter: string;
  dispatchTo: string;
  customerDepotName: string;
  quantities: Quantities;
  truckStatus: string;
  gatePassNo: string;
}

interface DocData {
  date: string;
  truckNo: string;
  ticket: string;
  sONo: string;
  invoiceNo: string;
  transporter: string;
  driverNo: string;
  deliveryTo: string;
  customerDepotName: string;
  soyaDocMT: number;
  sunflowerDocMT: number;
  totalMT: number;
  truckStatus: string;
  gatePassNo: string;
}

interface ExportData {
  [key: string]: string;
}

// Sample data
const sampleOilData: OilData[] = [
  {
    date: '2025-05-23',
    sNo: 1,
    sONo: 'SO123',
    ticketNo: 'T123',
    invoiceNo: 'INV123',
    truckNo: 'TRK123',
    driverNo: 'DRV123',
    transporter: 'Trans A',
    dispatchTo: 'Depot A',
    customerDepotName: 'Customer A',
    quantities: {
      '20L': 2864,
      '250ML Promo (pcs)': 306,
      '250ML Promo (box)': 0,
      '20L SQ.': 2377,
      '10L': 2019.75,
      '5L': 158.5,
      '3L': 747.58,
      '1L': 6,
      'Sunflower 1L': 77,
      '250ML': 7.11,
      '500ML': 8,
      '500ML Sunflower': 127.41,
      'MT': 89,
    },
    truckStatus: 'MT',
    gatePassNo: 'GATE123',
  },
];

const sampleChippyData: ChippyData[] = [
  {
    date: '2025-05-23',
    mobileNo: '1234567890',
    sONo: 'SO456',
    ebm: 'EBM123',
    ticketNo: 'T456',
    truckNo: 'TRK456',
    dispatchTo: 'Depot B',
    transporter: 'Trans B',
    nameOfParty: 'Party B',
    quantities: {
      '10KG BUCKET': 10,
      '5KG CHIPPY BOX': 5,
      '4.5KG CHIPPY': 3,
      '10KG CHIPPY YELLOW': 7,
      '10KG CHIPPY WHITE': 8,
      '17.5KG BUCKET': 2,
      'TOTAL (MT.)': 35,
    },
    truckStatus: 'Active',
    gatePassNo: 'GATE456',
  },
];

const sampleSoapData: SoapData[] = [
  {
    date: '2025-05-23',
    sNo: 1,
    ebm: 'EBM789',
    ticketNo: 'T789',
    sONo: 'SO789',
    truckNo: 'TRK789',
    driverNo: 'DRV789',
    transporter: 'Trans C',
    dispatchTo: 'Depot C',
    customerDepotName: 'Customer C',
    quantities: {
      '10X1kg WHITE': 100,
      '20X1kg WHITE': 200,
      '10x1kg POWER STAR': 150,
      '10x1kg Promotion': 50,
      '5x1kg WHITE': 75,
      '5x1kg Promotion': 25,
      '600GM WHITE': 60,
      '500GM WHITE': 40,
      '1KG BLUE': 30,
      '5x1KG BLUE': 20,
      '600GM BLUE': 10,
      '800 GM BLUE': 5,
      '500GM BLUE': 15,
      'MT': 780,
    },
    truckStatus: 'Active',
    gatePassNo: 'GATE789',
  },
];

const sampleDocData: DocData[] = [
  {
    date: '2025-05-23',
    truckNo: 'TRK101',
    ticket: 'T101',
    sONo: 'SO101',
    invoiceNo: 'INV101',
    transporter: 'Trans D',
    driverNo: 'DRV101',
    deliveryTo: 'Customer D',
    customerDepotName: 'Depot D',
    soyaDocMT: 10,
    sunflowerDocMT: 10,
    totalMT: 20,
    truckStatus: 'GATE PASS ISSUED',
    gatePassNo: 'GATE101',
  },
];

const sampleExportColumns: string[] = ['Column1', 'Column2', 'Column3'];
const sampleExportData: ExportData[] = [
  { Column1: 'Data1', Column2: 'Data2', Column3: 'Data3' },
  { Column1: 'Data4', Column2: 'Data5', Column3: 'Data6' },
];

// Dropdown options
const transporterOptions = ['Trans A', 'Trans B', 'Trans C', 'Trans D'];
const dispatchToOptions = ['Depot A', 'Depot B', 'Depot C', 'Customer D'];
const customerDepotOptions = ['Customer A', 'Customer B', 'Customer C', 'Depot D'];
const truckStatusOptions = ['Active', 'MT', 'GATE PASS ISSUED'];

// Soap Dispatch Component
const Soap: React.FC<{ data: SoapData[] }> = ({ data }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Soap Dispatch Report</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Date</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">S.No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">EBM</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Ticket No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">SO No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Truck No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Driver No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Transporter</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Dispatch To</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Customer</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Quantities</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Status</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Gate Pass</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-2 sm:p-3 whitespace-nowrap">{item.date}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.sNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.ebm}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.ticketNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.sONo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.truckNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.driverNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.transporter}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.dispatchTo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.customerDepotName}</td>
              <td className="border border-gray-200 p-2 sm:p-3">
                <div className="max-h-20 sm:max-h-24 overflow-y-auto text-xs">
                  {Object.entries(item.quantities).map(([key, value]) => (
                    <div key={key} className="truncate">{key}: {value}</div>
                  ))}
                </div>
              </td>
              <td className="border border-gray-200 p-2 sm:p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.truckStatus === 'Active' ? 'bg-green-100 text-green-800' :
                  item.truckStatus === 'MT' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.truckStatus}
                </span>
              </td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.gatePassNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Other Report Components (simplified)
const Oil: React.FC<{ data: OilData[] }> = ({ data }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Oil Dispatch Report</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Date</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">S.No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">SO No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Ticket No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Invoice No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Truck No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Driver No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Transporter</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Dispatch To</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Customer</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Quantities</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Status</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Gate Pass</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-2 sm:p-3 whitespace-nowrap">{item.date}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.sNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.sONo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.ticketNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.invoiceNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.truckNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.driverNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.transporter}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.dispatchTo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.customerDepotName}</td>
              <td className="border border-gray-200 p-2 sm:p-3">
                <div className="max-h-20 sm:max-h-24 overflow-y-auto text-xs">
                  {Object.entries(item.quantities).map(([key, value]) => (
                    <div key={key} className="truncate">{key}: {value}</div>
                  ))}
                </div>
              </td>
              <td className="border border-gray-200 p-2 sm:p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.truckStatus === 'Active' ? 'bg-green-100 text-green-800' :
                  item.truckStatus === 'MT' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.truckStatus}
                </span>
              </td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.gatePassNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Chippy: React.FC<{ data: ChippyData[] }> = ({ data }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Chippy Dispatch Report</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Date</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Mobile No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">SO No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">EBM</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Ticket No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Truck No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Dispatch To</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Transporter</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Party Name</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Quantities</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Status</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Gate Pass</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-2 sm:p-3 whitespace-nowrap">{item.date}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.mobileNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.sONo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.ebm}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.ticketNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.truckNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.dispatchTo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.transporter}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.nameOfParty}</td>
              <td className="border border-gray-200 p-2 sm:p-3">
                <div className="max-h-20 sm:max-h-24 overflow-y-auto text-xs">
                  {Object.entries(item.quantities).map(([key, value]) => (
                    <div key={key} className="truncate">{key}: {value}</div>
                  ))}
                </div>
              </td>
              <td className="border border-gray-200 p-2 sm:p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.truckStatus === 'Active' ? 'bg-green-100 text-green-800' :
                  item.truckStatus === 'MT' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.truckStatus}
                </span>
              </td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.gatePassNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Doc: React.FC<{ data: DocData[] }> = ({ data }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Doc Dispatch Report</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Date</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Truck No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Ticket</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">SO No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Invoice No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Transporter</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Driver No</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Delivery To</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Customer</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Soya Doc (MT)</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Sunflower Doc (MT)</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Total (MT)</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Status</th>
            <th className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">Gate Pass</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-2 sm:p-3 whitespace-nowrap">{item.date}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.truckNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.ticket}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.sONo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.invoiceNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.transporter}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.driverNo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.deliveryTo}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.customerDepotName}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.soyaDocMT}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.sunflowerDocMT}</td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.totalMT}</td>
              <td className="border border-gray-200 p-2 sm:p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.truckStatus === 'Active' ? 'bg-green-100 text-green-800' :
                  item.truckStatus === 'MT' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.truckStatus}
                </span>
              </td>
              <td className="border border-gray-200 p-2 sm:p-3">{item.gatePassNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Export: React.FC<{ data: ExportData[]; columns: string[] }> = ({ data, columns }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Export Dispatch Report</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            {columns.map((col) => (
              <th key={col} className="border border-gray-200 p-2 sm:p-3 text-left font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
            {columns.map((col) => (
              <td key={col} className="border border-gray-200 p-2 sm:p-3">{item[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
);

// Main Dispatch Component
const Dispatch: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('Soap');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState<any>({ quantities: {} });
  const [previewData, setPreviewData] = useState<any>(null);
  const [isQuantitiesOpen, setIsQuantitiesOpen] = useState<boolean>(false);

  const reportTypes = ['Oil', 'Chippy', 'Soap', 'Doc', 'Export'];

  // Filter data based on search term
  const filterData = <T extends object>(data: T[], keys: string[]): T[] => {
    return data.filter((item) =>
      keys.some((key) =>
        String((item as any)[key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filteredOilData = filterData<OilData>(sampleOilData, [
    'date', 'sONo', 'ticketNo', 'invoiceNo', 'truckNo', 'driverNo', 'transporter', 'dispatchTo', 'customerDepotName', 'truckStatus', 'gatePassNo'
  ]);
  const filteredChippyData = filterData<ChippyData>(sampleChippyData, [
    'date', 'mobileNo', 'sONo', 'ebm', 'ticketNo', 'truckNo', 'dispatchTo', 'transporter', 'nameOfParty', 'truckStatus', 'gatePassNo'
  ]);
  const filteredSoapData = filterData<SoapData>(sampleSoapData, [
    'date', 'sONo', 'ebm', 'ticketNo', 'truckNo', 'driverNo', 'transporter', 'dispatchTo', 'customerDepotName', 'truckStatus', 'gatePassNo'
  ]);
  const filteredDocData = filterData<DocData>(sampleDocData, [
    'date', 'truckNo', 'ticket', 'sONo', 'invoiceNo', 'transporter', 'driverNo', 'deliveryTo', 'customerDepotName', 'truckStatus', 'gatePassNo'
  ]);
  const filteredExportData = filterData<ExportData>(sampleExportData, sampleExportColumns);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handle quantity input changes
  const handleQuantityChange = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      quantities: { ...prev.quantities, [key]: parseFloat(value) || 0 }
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted! Check console for data.');
  };

  // Handle preview
  const handlePreview = () => {
    setPreviewData(formData);
  };

  // Toggle quantities section
  const toggleQuantities = () => {
    setIsQuantitiesOpen(!isQuantitiesOpen);
  };

  // Render form based on selected report type
  const renderForm = () => {
    switch (selectedReport) {
      case 'Soap':
        return (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Soap Dispatch Form</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">S.No</label>
                <input
                  type="number"
                  name="sNo"
                  value={formData.sNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">EBM</label>
                <input
                  type="text"
                  name="ebm"
                  value={formData.ebm || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ticket No</label>
                <input
                  type="text"
                  name="ticketNo"
                  value={formData.ticketNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SO No</label>
                <input
                  type="text"
                  name="sONo"
                  value={formData.sONo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck No</label>
                <input
                  type="text"
                  name="truckNo"
                  value={formData.truckNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver No</label>
                <input
                  type="text"
                  name="driverNo"
                  value={formData.driverNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transporter</label>
                <input
                  list="transporterOptionsList"
                  name="transporter"
                  value={formData.transporter || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter or select transporter"
                />
                <datalist id="transporterOptionsList">
                  <option value="Meru" />
                  <option value="by self" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dispatch To</label>
                <input
                  list="dispatchToOptionsList"
                  name="dispatchTo"
                  value={formData.dispatchTo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter or select dispatch to"
                />
                <datalist id="dispatchToOptionsList">
                  {dispatchToOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Depot Name</label>
                <input
                  list="customerDepotOptionsList"
                  name="customerDepotName"
                  value={formData.customerDepotName || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter or select customer"
                />
                <datalist id="customerDepotOptionsList">
                  {customerDepotOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck Status</label>
                <select
                  name="truckStatus"
                  value={formData.truckStatus || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Status</option>
                  {truckStatusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gate Pass No</label>
                <input
                  type="text"
                  name="gatePassNo"
                  value={formData.gatePassNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <button
                  onClick={toggleQuantities}
                  className="w-full bg-blue-100 text-blue-800 p-3 rounded-lg font-medium flex justify-between items-center"
                >
                  <span>Quantities</span>
                  <span>{isQuantitiesOpen ? '▲' : '▼'}</span>
                </button>
                {isQuantitiesOpen && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(sampleSoapData[0].quantities).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700">{key}</label>
                        <input
                          type="number"
                          name={key}
                          value={formData.quantities[key] || ''}
                          onChange={(e) => handleQuantityChange(key, e.target.value)}
                          className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'Oil':
        return (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Oil Dispatch Form</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">S.No</label>
                <input
                  type="number"
                  name="sNo"
                  value={formData.sNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SO No</label>
                <input
                  type="text"
                  name="sONo"
                  value={formData.sONo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ticket No</label>
                <input
                  type="text"
                  name="ticketNo"
                  value={formData.ticketNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice No</label>
                <input
                  type="text"
                  name="invoiceNo"
                  value={formData.invoiceNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck No</label>
                <input
                  type="text"
                  name="truckNo"
                  value={formData.truckNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver No</label>
                <input
                  type="text"
                  name="driverNo"
                  value={formData.driverNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transporter</label>
                <select
                  name="transporter"
                  value={formData.transporter || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Transporter</option>
                  {transporterOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dispatch To</label>
                <select
                  name="dispatchTo"
                  value={formData.dispatchTo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Depot</option>
                  {dispatchToOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Depot Name</label>
                <select
                  name="customerDepotName"
                  value={formData.customerDepotName || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Customer</option>
                  {customerDepotOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck Status</label>
                <select
                  name="truckStatus"
                  value={formData.truckStatus || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Status</option>
                  {truckStatusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gate Pass No</label>
                <input
                  type="text"
                  name="gatePassNo"
                  value={formData.gatePassNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <button
                  onClick={toggleQuantities}
                  className="w-full bg-blue-100 text-blue-800 p-3 rounded-lg font-medium flex justify-between items-center"
                >
                  <span>Quantities</span>
                  <span>{isQuantitiesOpen ? '▲' : '▼'}</span>
                </button>
                {isQuantitiesOpen && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(sampleOilData[0].quantities).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700">{key}</label>
                        <input
                          type="number"
                          name={key}
                          value={formData.quantities[key] || ''}
                          onChange={(e) => handleQuantityChange(key, e.target.value)}
                          className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'Chippy':
        return (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Chippy Dispatch Form</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile No</label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SO No</label>
                <input
                  type="text"
                  name="sONo"
                  value={formData.sONo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">EBM</label>
                <input
                  type="text"
                  name="ebm"
                  value={formData.ebm || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ticket No</label>
                <input
                  type="text"
                  name="ticketNo"
                  value={formData.ticketNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck No</label>
                <input
                  type="text"
                  name="truckNo"
                  value={formData.truckNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dispatch To</label>
                <select
                  name="dispatchTo"
                  value={formData.dispatchTo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Depot</option>
                  {dispatchToOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transporter</label>
                <select
                  name="transporter"
                  value={formData.transporter || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Transporter</option>
                  {transporterOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name of Party</label>
                <input
                  type="text"
                  name="nameOfParty"
                  value={formData.nameOfParty || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck Status</label>
                <select
                  name="truckStatus"
                  value={formData.truckStatus || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Status</option>
                  {truckStatusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gate Pass No</label>
                <input
                  type="text"
                  name="gatePassNo"
                  value={formData.gatePassNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <button
                  onClick={toggleQuantities}
                  className="w-full bg-blue-100 text-blue-800 p-3 rounded-lg font-medium flex justify-between items-center"
                >
                  <span>Quantities</span>
                  <span>{isQuantitiesOpen ? '▲' : '▼'}</span>
                </button>
                {isQuantitiesOpen && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(sampleChippyData[0].quantities).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700">{key}</label>
                        <input
                          type="number"
                          name={key}
                          value={formData.quantities[key] || ''}
                          onChange={(e) => handleQuantityChange(key, e.target.value)}
                          className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'Doc':
        return (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Doc Dispatch Form</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck No</label>
                <input
                  type="text"
                  name="truckNo"
                  value={formData.truckNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ticket</label>
                <input
                  type="text"
                  name="ticket"
                  value={formData.ticket || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SO No</label>
                <input
                  type="text"
                  name="sONo"
                  value={formData.sONo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice No</label>
                <input
                  type="text"
                  name="invoiceNo"
                  value={formData.invoiceNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transporter</label>
                <select
                  name="transporter"
                  value={formData.transporter || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Transporter</option>
                  {transporterOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver No</label>
                <input
                  type="text"
                  name="driverNo"
                  value={formData.driverNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery To</label>
                <select
                  name="deliveryTo"
                  value={formData.deliveryTo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Depot</option>
                  {dispatchToOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Depot Name</label>
                <select
                  name="customerDepotName"
                  value={formData.customerDepotName || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Customer</option>
                  {customerDepotOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soya Doc (MT)</label>
                <input
                  type="number"
                  name="soyaDocMT"
                  value={formData.soyaDocMT || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sunflower Doc (MT)</label>
                <input
                  type="number"
                  name="sunflowerDocMT"
                  value={formData.sunflowerDocMT || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Truck Status</label>
                <select
                  name="truckStatus"
                  value={formData.truckStatus || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Status</option>
                  {truckStatusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gate Pass No</label>
                <input
                  type="text"
                  name="gatePassNo"
                  value={formData.gatePassNo || ''}
                  onChange={handleInputChange}
                  className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        );
      case 'Export':
        return (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Export Dispatch Form</h3>
            <div className="grid grid-cols-1 gap-4">
              {sampleExportColumns.map((col) => (
                <div key={col}>
                  <label className="block text-sm font-medium text-gray-700">{col}</label>
                  <input
                    type="text"
                    name={col}
                    value={formData[col] || ''}
                    onChange={handleInputChange}
                    className="mt-1 border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Daily Dispatch Reports</h1>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Controls Section */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Controls</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm md:text-sm font-medium text-gray-700">Report Type</label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="mt-1 border border-gray-300 p-2 sm:p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm md:text-sm transition-all duration-200"
                >
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>{type} Report</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm md:text-sm font-medium text-gray-700">Search Reports</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by any field..."
                  className="mt-1 border border-gray-300 p-2 sm:p-3 rounded w-full focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm md:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Enter {selectedReport} Dispatch Data</h2>
            {renderForm()}
            <div className="mt-5 flex flex-col sm:flex-row sm:gap-4 gap-3">
              <button
                onClick={handlePreview}
                className="bg-blue-500 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm md:text-base"
              >
                Preview
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm md:text-base"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Preview and Data Section */}
          <div className="md:col-span-2 lg:col-span-1">
            {previewData && (
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 mb-3 sm:mb-4 md:mb-6">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Preview Data</h2>
                <div className="bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg overflow-x-auto">
                  <pre className="text-xs sm:text-sm md:text-base text-gray-700">{JSON.stringify(previewData, null, 2)}</pre>
                </div>
              </div>
            )}
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{selectedReport} Dispatch Report</h2>
              {selectedReport === 'Oil' && <Oil data={filteredOilData} />}
              {selectedReport === 'Chippy' && <Chippy data={filteredChippyData} />}
              {selectedReport === 'Soap' && <Soap data={filteredSoapData} />}
              {selectedReport === 'Doc' && <Doc data={filteredDocData} />}
              {selectedReport === 'Export' && <Export data={filteredExportData} columns={sampleExportColumns} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispatch;