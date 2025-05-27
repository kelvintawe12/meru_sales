import React, { useEffect, useState, createContext, useContext } from 'react';
import { AlertCircleIcon, CheckCircleIcon, XIcon } from 'lucide-react';
export type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
interface ToasterContextType {
  showToast: (message: string, type: ToastType) => void;
}
export const ToasterContext = createContext<ToasterContextType>({
  showToast: () => {}
});
export const useToast = () => useContext(ToasterContext);
export const ToasterProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, {
      id,
      message,
      type
    }]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  return <ToasterContext.Provider value={{
    showToast
  }}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} />
    </ToasterContext.Provider>;
};
interface ToasterProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}
export const Toaster: React.FC<ToasterProps> = ({
  toasts,
  removeToast
}) => {
  return <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {toasts.map(toast => <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />)}
    </div>;
};
interface ToastItemProps {
  toast: Toast;
  removeToast: (id: string) => void;
}
const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  removeToast
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircleIcon className="text-red-500" size={20} />;
      case 'info':
        return <AlertCircleIcon className="text-blue-500" size={20} />;
      default:
        return null;
    }
  };
  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };
  return <div className={`min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-md border ${getBgColor()} animate-slideIn`} style={{
    animation: 'slideIn 0.3s ease-out forwards'
  }}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-gray-800">{toast.message}</p>
        </div>
        <button onClick={() => removeToast(toast.id)} className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500">
          <XIcon size={16} />
        </button>
      </div>
    </div>;
};