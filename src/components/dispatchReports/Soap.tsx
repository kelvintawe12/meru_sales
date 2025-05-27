import React from 'react';

interface SoapReportData {
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
  quantities: {
    [key: string]: number | string; // e.g. '10X1kg WHITE', '20X1kg WHITE', etc.
  };
  truckStatus: string;
  gatePassNo: string;
}

interface SoapProps {
  data: SoapReportData[];
}

const headerColumns = [
  'DATE', 'S. NO.', 'EBM', 'TICKET NO', 'S.O. NO.', 'TRUCK NO.', 'DRIVER NO.', 'TRANSPORTER',
  'DISPATCH TO', 'CUSTOMER/ DEPOT NAME', '10X1kg WHITE', '20X1kg WHITE', '10x1kg POWER STAR',
  '10x1kg Promotion', '5x1kg WHITE', '5x1kg Promotion', '600GM WHITE', '500GM WHITE',
  '1KG BLUE', '5x1KG BLUE', '600GM BLUE', '800 GM BLUE', '500GM BLUE', 'MT', 'TRUCK STATUS', 'GATE PASS NO'
];

const Soap: React.FC<SoapProps> = ({ data }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-green-600 text-white">
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
            <tr key={idx} className="even:bg-green-50 odd:bg-white">
              <td className="border border-gray-300 px-2 py-1 text-center">{row.date}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.ebm}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.ticketNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sONo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.truckNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.driverNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.transporter}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.dispatchTo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.customerDepotName}</td>
              {headerColumns.slice(10, 23).map((key) => (
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

export default Soap;
