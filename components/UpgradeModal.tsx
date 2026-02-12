import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: 'PRO' | 'PREMIUM';
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName, requiredPlan }) => {
  const { tenant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Correção para Vite: usar import.meta.env em vez de process.env
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${API_URL}/subscriptions/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Adicionar token de autenticação aqui
        },
        body: JSON.stringify({
          planId: requiredPlan, // 'PREMIUM'
          tenantId: tenant?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar pagamento');
      }

      const { url } = await response.json();
      
      // Redireciona para o Checkout do Stripe
      if (url) {
        window.location.href = url;
      } else {
        alert("Erro: URL de pagamento não retornada pelo servidor.");
      }

    } catch (error) {
      // Em produção, logaríamos o erro. No demo, assumimos que o backend pode não estar rodando.
      console.warn('Backend indisponível, ativando fallback de demonstração.');
      
      if (confirm("O backend de pagamento não foi detectado (Demo Mode). Deseja simular o sucesso?")) {
         window.location.href = window.location.origin + '/upgrade/success?session_id=demo_123';
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-[fade-in_0.2s_ease-out]">
        {/* Header with image/gradient */}
        <div className="bg-gradient-to-br from-primary to-accent h-32 flex items-center justify-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg">
            <i className="fas fa-rocket text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent"></i>
          </div>
        </div>

        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Desbloqueie {featureName}
          </h2>
          <p className="text-gray-500 mb-6">
            O recurso <strong>{featureName}</strong> é exclusivo do plano <span className="font-bold text-primary">{requiredPlan}</span>. 
            Faça um upgrade hoje para acessar esta e outras funcionalidades incríveis.
          </p>

          <div className="space-y-3 mb-8">
             <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg text-left">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                   <i className="fas fa-check"></i>
                </div>
                <div>
                   <h4 className="font-bold text-gray-800 text-sm">Dashboard Avançado</h4>
                   <p className="text-xs text-gray-500">Métricas completas e exportação</p>
                </div>
             </div>
             <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg text-left">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                   <i className="fas fa-check"></i>
                </div>
                <div>
                   <h4 className="font-bold text-gray-800 text-sm">Delivery & Entregas</h4>
                   <p className="text-xs text-gray-500">Gerencie entregadores e clientes</p>
                </div>
             </div>
             <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg text-left">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                   <i className="fas fa-check"></i>
                </div>
                <div>
                   <h4 className="font-bold text-gray-800 text-sm">Alertas de Estoque</h4>
                   <p className="text-xs text-gray-500">Nunca mais fique sem ingredientes</p>
                </div>
             </div>
          </div>

          <button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2
              ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-lock-open"></i>}
            {isLoading ? 'Processando...' : 'Fazer Upgrade Agora'}
          </button>
          
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Agora não, obrigado
          </button>
        </div>
      </div>
    </div>
  );
};