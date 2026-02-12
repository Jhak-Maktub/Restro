import React from 'react';

export const UpgradeCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-times text-4xl text-gray-500"></i>
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-4">Pagamento Cancelado</h1>
        <p className="text-gray-600 mb-8">
          O processo de pagamento não foi concluído. Nenhuma cobrança foi realizada no seu cartão.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
};