import React, { useEffect, useState } from 'react';
import { ToastMessage, ToastType } from '../../contexts/ToastContext';
import CheckCircleIcon from '../icons/CheckCircleIcon'; // Green
import XCircleIcon from '../icons/XCircleIcon'; // Red
import InformationCircleIcon from '../icons/InformationCircleIcon'; // Blue
import ExclamationTriangleIcon from '../icons/ExclamationTriangleIcon'; // Yellow

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Trigger enter animation
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Trigger leave animation
    setTimeout(() => onRemove(toast.id), 300); // Remove after animation
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-100" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-100" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-100" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-100" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-100" />;
    }
  };

  const getBackgroundColor = (type: ToastType) => {
    // Using more vibrant and theme-consistent colors
    switch (type) {
      case 'success':
        return 'bg-emerald-500 dark:bg-emerald-600'; // More vibrant green
      case 'error':
        return 'bg-destructive dark:bg-red-700'; // Using theme's destructive
      case 'info':
        return 'bg-sky-500 dark:bg-sky-600'; // Clear blue for info
      case 'warning':
        return 'bg-amber-500 dark:bg-amber-600'; // Distinct yellow/orange for warning
      default:
        return 'bg-sky-500 dark:bg-sky-600';
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        w-full max-w-sm rounded-lg shadow-lg p-4 text-white
        ${getBackgroundColor(toast.type)}
        flex items-start space-x-3
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-full'}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(toast.type)}
      </div>
      <div className="flex-1 text-sm font-medium">
        {toast.message}
      </div>
      <button
        onClick={handleClose}
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
        aria-label="Close"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

export default ToastItem;