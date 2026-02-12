import React from 'react';
import { SectionTitle } from './SectionTitle';

const features = [
  { icon: 'fa-tachometer-alt', title: 'Dashboard Inteligente', text: 'Receita do dia, ticket médio, prato mais vendido e alertas de estoque em um só lugar.' },
  { icon: 'fa-utensils', title: 'Gestão de Pedidos', text: 'Salão, delivery ou takeaway. Status em tempo real: novo, preparo, pronto, entregue.' },
  { icon: 'fa-box-open', title: 'Controle de Estoque', text: 'Baixa automática ao vender, alerta de mínimo, histórico de consumo e reposição.' },
  { icon: 'fa-users', title: 'Funcionários e Comissões', text: 'Cargos, turnos, relatório de vendas por garçom e cálculo automático de comissões.' },
  { icon: 'fa-file-invoice-dollar', title: 'Relatórios Avançados', text: 'Lucro líquido, despesas, produto mais rentável, comparação mensal e exportação PDF/Excel.' },
  { icon: 'fa-crown', title: 'Multi‑filial (Premium)', text: 'Gerencie várias unidades com dados centralizados e permissões personalizadas.' },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="solucoes" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <SectionTitle 
          title="Tudo o que seu restaurante precisa"
          subtitle="O RestroFlow integra cada área do seu negócio em um só lugar, com dados em tempo real e automação inteligente."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center border border-gray-100"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl mb-6 shadow-lg shadow-orange-100">
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};