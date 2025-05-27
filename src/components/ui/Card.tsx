import React from 'react';
interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}
export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = ''
}) => {
  return <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>
      {title && <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        </div>}
      <div className="p-6">{children}</div>
    </div>;
};