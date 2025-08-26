

import React, { ReactNode, useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // Controls actual rendering and in-DOM status
  const [isAnimating, setIsAnimating] = useState(false); // Controls animation classes

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      // Timeout to allow display:block before animation starts
      const timer = setTimeout(() => setIsAnimating(true), 10); 
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false); // Start fade-out animation
      const timer = setTimeout(() => setIsModalVisible(false), 300); // Duration of animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isModalVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm
                  bg-black/60 dark:bg-black/70 
                  transition-opacity duration-300 ease-out-cubic
                  ${isAnimating && isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose} // Keep onClose on backdrop for accessibility
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`relative w-full max-w-lg p-6 bg-card rounded-xl shadow-xl 
                   dark:bg-dark-card dark:border dark:border-dark-border
                   transition-all duration-300 ease-out-cubic
                   ${isAnimating && isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {title && (
          <div className="pb-4 mb-4 border-b border-border dark:border-dark-border">
            <h3 id="modal-title" className="text-xl font-semibold text-card-foreground dark:text-dark-card-foreground">{title}</h3>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground dark:text-dark-muted-foreground dark:hover:text-dark-foreground p-1 rounded-full hover:bg-muted dark:hover:bg-dark-muted transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="text-card-foreground dark:text-dark-card-foreground">
          {children}
        </div>

        {footer && (
          <div className="pt-4 mt-4 border-t border-border dark:border-dark-border flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;