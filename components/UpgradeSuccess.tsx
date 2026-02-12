import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const UpgradeSuccess: React.FC = () => {
  const { updateTenantPlan } = useAuth();

  useEffect(() => {
    // Obter parâmetros da URL para log (opcional)
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    console.log(`💳 [Frontend] Pagamento processado com sucesso! Session ID: ${sessionId || 'Simulação'}`);
    console.log('🔄 Atualizando permissões do tenant para PREMIUM...');

    // Em um cenário real, o backend já teria processado o Webhook.
    // Aqui forçamos a atualização do estado local para refletir a mudança imediatamente na UI.
    updateTenantPlan('PREMIUM');
    
    // Redirecionar para dashboard após 5 segundos
    const timer = setTimeout(() => {
        window.location.href = '/';
    }, 5000);

    return () => clearTimeout(timer);
  }, [updateTenantPlan]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center animate-[scale-in_0.3s_ease-out]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-4xl text-green-600"></i>
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Pagamento Aprovado!</h1>
        <p className="text-gray-600 mb-8">
          Seu restaurante agora é <span className="font-bold text-primary">Premium</span>. Aproveite o Multi-filial e todos os benefícios exclusivos.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-light transition-colors"
        >
          Voltar para o Dashboard
        </button>
        <p className="text-xs text-gray-400 mt-4">Redirecionando em instantes...</p>
      </div>
    </div>
  );
};