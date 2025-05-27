import React from 'react';

interface ChippyReportData {
  date: string;
  mobileNo: string;
  sONo: string;
  ebm: string;
  ticketNo: string;
  truckNo: string;
  dispatchTo: string;
  transporter: string;
  nameOfParty: string;
  quantities: {
    [key: string]: number | string; // e.g. '10KG BUCKET', '5KG CHIPPY BOX', etc.
  };
  truckStatus: string;
  gatePassNo: string;
}

interface ChippyProps {
  data: ChippyReportData[];
}

const headerColumns = [
  'DATE', 'MOBILE NO.', 'S.O.NO', 'EBM', 'Ticket No', 'TRUCK NO.', 'DISPATCH TO', 'TRANSPORTER',
  'NAME OF PARTY', '10KG BUCKET', '5KG CHIPPY BOX', '4.5KG CHIPPY', '10KG CHIPPY YELLOW',
  '10KG CHIPPY WHITE', '17.5KG BUCKET', 'TOTAL (MT.)', 'TRUCK STATUS', 'Gate Pass No'
];

const Chippy: React.FC<ChippyProps> = ({ data }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-blue-200">
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
            <tr key={idx} className="even:bg-blue-50 odd:bg-white">
              <td className="border border-gray-300 px-2 py-1 text-center">{row.date}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.mobileNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sONo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.ebm}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.ticketNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.truckNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.dispatchTo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.transporter}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.nameOfParty}</td>
              {headerColumns.slice(9, 16).map((key) => (
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

export default Chippy;
