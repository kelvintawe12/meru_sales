import React from 'react';

interface ExportReportData {
  [key: string]: any; // Flexible data structure for export report
}

interface ExportProps {
  data: ExportReportData[];
  columns: string[];
}

const Export: React.FC<ExportProps> = ({ data, columns }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-300">
          <tr>
            {columns.map((col) => (
              <th key={col} className="border border-gray-400 px-2 py-1 whitespace-nowrap text-center font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
              {columns.map((col) => (
                <td key={col} className="border border-gray-300 px-2 py-1 text-center">
                  {row[col] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Export;
