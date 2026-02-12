import React from 'react';
import { SectionTitle } from './SectionTitle';

const problems = [
  {
    icon: 'fa-chart-line',
    title: 'Falta de controle financeiro',
    text: 'Você não sabe exatamente quanto lucrou ontem, esta semana ou este mês. Informações espalhadas.'
  },
  {
    icon: 'fa-boxes',
    title: 'Estoque desorganizado',
    text: 'Ingredientes que vencem, compras em excesso ou falta do essencial. Prejuízo e insatisfação.'
  },
  {
    icon: 'fa-clipboard-list',
    title: 'Pedidos perdidos',
    text: 'Comandas de papel, comunicação falha com a cozinha, pedidos que saem errados ou atrasam.'
  }
];

export const ProblemSection: React.FC = () => {
  return (
    <section id="problemas" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <SectionTitle 
          title="Você perde dinheiro por quê?"
          subtitle="Restaurantes perdem até 30% do faturamento com falhas operacionais. Identificamos os principais gargalos."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary text-3xl group-hover:bg-primary group-hover:text-white transition-colors">
                <i className={`fas ${problem.icon}`}></i>
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {problem.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};