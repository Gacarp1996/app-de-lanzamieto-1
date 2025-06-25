import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4"> {/* Increased z-index */}
      <div className="bg-app-surface p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-app-accent">{title}</h3>
          <button
            onClick={onClose}
            className="text-app-secondary hover:text-app-primary transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
