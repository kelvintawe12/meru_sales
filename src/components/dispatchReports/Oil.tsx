import React from 'react';

interface OilReportData {
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
  quantities: {
    [key: string]: number | string; // e.g. '20L', '250ML Promo', etc.
  };
  truckStatus: string;
  gatePassNo: string;
}

interface OilProps {
  data: OilReportData[];
}

const headerColumns = [
  'DATE', 'S.NO', 'S. O. NO.', 'TICKET NO.', 'INVOICE NO', 'TRUCK NO.', 'DRIVER NO.', 'TRANSPORTER',
  'DISPATCH TO', 'CUSTOMER & DEPOT NAME', '20L', '250ML Promo (pcs)', '250ML Promo (box)', '20L SQ.',
  '10L', '5L', '3L', '1L', 'Sunflower 1L', '250ML', '500ML', '500ML Sunflower', 'MT', 'GATE PASS NO', 'TRUCK STATUS'
];

const Oil: React.FC<OilProps> = ({ data }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-yellow-300">
          <tr>
            {headerColumns.map((col) => (
              <th key={col} className="border border-gray-400 px-2 py-1 whitespace-nowrap text-center font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="even:bg-yellow-50 odd:bg-white">
              <td className="border border-gray-300 px-2 py-1 text-center">{row.date}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sONo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.ticketNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.invoiceNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.truckNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.driverNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.transporter}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.dispatchTo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.customerDepotName}</td>
              {headerColumns.slice(10, 22).map((key) => (
                <td key={key} className="border border-gray-300 px-2 py-1 text-right">
                  {row.quantities[key] ?? '-'}
                </td>
              ))}
              <td className="border border-gray-300 px-2 py-1 text-center">{row.truckStatus}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.gatePassNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Oil;
