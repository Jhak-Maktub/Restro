import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const { openSignup, loginAsDemo } = useAuth();

  const handleDemoClick = async () => {
    await loginAsDemo();
  };

  return (
    <section id="home" className="pt-40 pb-20 bg-gradient-to-br from-[rgba(15,118,110,0.05)] to-[rgba(249,115,22,0.05)]">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 leading-[1.2]">
            Controle total do seu <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">restaurante</span> em um único aplicativo.
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            RestroFlow é a plataforma SaaS que unifica vendas, estoque, funcionários e relatórios em tempo real. Menos caos, mais lucro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button 
              onClick={openSignup}
              className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary-light hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-rocket"></i> Teste grátis 7 dias
            </button>
            <button 
              onClick={handleDemoClick}
              className="px-8 py-4 rounded-full border-2 border-primary text-primary font-bold text-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-play-circle"></i> Ver demonstração
            </button>
          </div>
        </div>
        <div className="relative group perspective-1000">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Dashboard RestroFlow" 
            className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-500 group-hover:rotate-y-2 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl -z-10"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};