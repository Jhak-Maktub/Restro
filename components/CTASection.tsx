import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

export const CTASection: React.FC = () => {
  const { openSignup } = useAuth();
  const { openModal } = useModal();

  const handleContactClick = () => {
    openModal('Falar com um Especialista', (
      <div className="flex flex-col items-center animate-[fade-in_0.3s_ease-out]">
        {/* Profile Section */}
        <div className="relative mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white">
                <span role="img" aria-label="consultant">👨‍💼</span>
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full animate-pulse" title="Online Agora"></div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900">João Comercial</h3>
        <p className="text-sm text-gray-500 mb-8 font-medium">Consultor Sênior RestroFlow</p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
            {/* WhatsApp - Link direto universal */}
            <a 
                href="https://wa.me/258842104725?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20planos%20do%20RestroFlow." 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] hover:-translate-y-0.5 transition-all shadow-sm group"
            >
                <i className="fab fa-whatsapp text-2xl group-hover:scale-110 transition-transform"></i> 
                <span className="text-center">Conversar no WhatsApp</span>
            </a>

            {/* Call - Protocolo tel: sem espaços para compatibilidade mobile */}
            <a 
                href="tel:+258842104725" 
                className="flex items-center justify-center gap-3 w-full py-4 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-sm"
            >
                <i className="fas fa-phone-alt text-lg"></i> 
                <span className="text-center">Ligar Agora (+258 84 210 4725)</span>
            </a>

            {/* Email */}
            <a 
                href="mailto:comercial@restroflow.com" 
                className="flex items-center justify-center gap-3 w-full py-4 px-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
                <i className="far fa-envelope text-lg text-gray-500"></i> 
                <span className="text-center">Enviar Email</span>
            </a>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Horário de Atendimento</p>
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700 text-xs font-bold">
                <i className="far fa-clock"></i> Segunda a Sexta, 08h às 17h
            </div>
        </div>
      </div>
    ));
  };

  return (
    <section id="comecar" className="py-24 bg-gradient-to-br from-primary to-accent text-white text-center">
      <div className="container mx-auto px-6">
        <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
          Transforme seu restaurante hoje
        </h2>
        <p className="text-xl opacity-95 max-w-2xl mx-auto mb-10 leading-relaxed">
          Mais de 200 restaurantes já aumentaram seu lucro com o RestroFlow. Comece com 7 dias grátis, sem compromisso.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button 
            onClick={openSignup}
            className="px-8 py-4 bg-white text-primary font-bold text-lg rounded-full shadow-lg hover:bg-gray-100 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-calendar-check"></i> Teste grátis
          </button>
          <button 
            onClick={handleContactClick}
            className="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-headset"></i> Falar com consultor
          </button>
        </div>
      </div>
    </section>
  );
};