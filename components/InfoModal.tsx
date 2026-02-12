import React, { useEffect } from 'react';
import { useModal } from '../context/ModalContext';

export const InfoModal: React.FC = () => {
  const { isOpen, content, closeModal } = useModal();

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={closeModal}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 animate-[fade-in_0.2s_ease-out]">
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <i className="fas fa-times text-lg"></i>
        </button>

        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-display font-extrabold text-xl text-primary mb-1">
            <i className="fas fa-info-circle text-accent"></i> Informação
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {content.title}
          </h2>
        </div>

        <div className="text-gray-600 leading-relaxed space-y-4">
          {content.body}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={closeModal}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};