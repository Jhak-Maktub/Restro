import React from 'react';
import { SectionTitle } from './SectionTitle';
import { PricingPlan } from '../types';
import { useAuth } from '../context/AuthContext';

const PLANS: PricingPlan[] = [
  {
    name: 'Starter',
    price: '2.500',
    currency: 'MZN',
    period: '/mês',
    features: [
      'Até 5 funcionários',
      'Dashboard básico',
      'Gestão de pedidos',
      'Controle de estoque',
      'Relatórios simples'
    ],
    buttonText: 'Começar teste grátis',
    buttonVariant: 'outline'
  },
  {
    name: 'Pro',
    price: '5.000',
    currency: 'MZN',
    period: '/mês',
    features: [
      'Funcionários ilimitados',
      'Dashboard avançado',
      'Gestão de pedidos + Delivery',
      'Estoque com alerta automático',
      'Relatórios avançados',
      'Exportação PDF/Excel'
    ],
    isPopular: true,
    buttonText: 'Começar teste grátis',
    buttonVariant: 'primary'
  },
  {
    name: 'Premium',
    price: '8.000',
    currency: 'MZN',
    period: '/mês',
    features: [
      'Tudo do Pro',
      'Multi‑filial',
      'Personalização da plataforma',
      'API de integração',
      'Suporte prioritário 24h',
      'Gerente de sucesso dedicado'
    ],
    buttonText: 'Falar com vendas',
    buttonVariant: 'outline'
  }
];

export const PricingSection: React.FC = () => {
  const { openSignup } = useAuth();

  return (
    <section id="precos" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <SectionTitle 
          title="Planos para todos os tamanhos"
          subtitle="Escolha o plano ideal para o seu negócio. Cancele quando quiser."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-white rounded-2xl p-8 transition-all duration-300 flex flex-col ${
                plan.isPopular 
                  ? 'border-2 border-primary shadow-xl scale-105 z-10' 
                  : 'border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-2'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-end justify-center gap-1 text-gray-900">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-gray-500 font-medium mb-1.5 text-lg">{plan.currency}{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <i className="fas fa-check text-primary text-sm"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={openSignup}
                className={`w-full py-3 px-6 rounded-full font-bold text-center transition-all ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-primary text-white hover:bg-primary-light shadow-md hover:shadow-lg'
                    : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};