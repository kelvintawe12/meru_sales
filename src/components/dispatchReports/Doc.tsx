import React from 'react';

interface DocReportData {
  date: string;
  truckNo: string;
  ticket: string;
  sONo: string;
  invoiceNo: string;
  transporter: string;
  driverNo: string;
  deliveryTo: string;
  customerDepotName: string;
  soyaDocMT: number | string;
  sunflowerDocMT: number | string;
  totalMT: number | string;
  truckStatus: string;
  gatePassNo: string;
}

interface DocProps {
  data: DocReportData[];
}

const headerColumns = [
  'DATE', 'TRUCK NO.', 'TICKET', 'S.O', 'INVOICE No', 'TRANSPORTER', 'DRIVER NO.', 'DELIVERY TO',
  'CUSTOMER/ DEPOT NAME', 'SOYA DOC (MT)', 'SUNFLOWER DOC (MT)', 'TOTAL MT', 'TRUCK STATUS', 'GATE PASS NO'
];

const Doc: React.FC<DocProps> = ({ data }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-yellow-200">
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
              <td className="border border-gray-300 px-2 py-1 text-center">{row.truckNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.ticket}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sONo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.invoiceNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.transporter}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.driverNo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.deliveryTo}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.customerDepotName}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{row.soyaDocMT}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{row.sunflowerDocMT}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{row.totalMT}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.truckStatus}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.gatePassNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Doc;
