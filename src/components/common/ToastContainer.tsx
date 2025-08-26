import React from 'react';
import { useToast } from '../../hooks/useToast';
import ToastItem from './ToastItem';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="false" // To allow screen readers to announce multiple toasts as they appear
      className="fixed top-6 right-6 z-[100] w-full max-w-sm space-y-3"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;