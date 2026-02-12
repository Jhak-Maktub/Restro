import React from 'react';
import { SectionTitle } from './SectionTitle';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Seg', value: 3200 },
  { name: 'Ter', value: 4500 },
  { name: 'Qua', value: 4100 },
  { name: 'Qui', value: 5800 },
  { name: 'Sex', value: 7200 },
  { name: 'Sáb', value: 8500 },
  { name: 'Dom', value: 6900 },
];

export const DashboardPreview: React.FC = () => {
  return (
    <section id="demo" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionTitle 
          title="Veja o RestroFlow em ação"
          subtitle="Uma prévia do nosso dashboard inteligente. Dados reais, atualizados a cada segundo."
        />

        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
          {/* Header Mockup */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between text-white">
            <h3 className="text-2xl font-display font-bold flex items-center gap-3">
              <i className="fas fa-store"></i> Restaurante Villa Gourmet
            </h3>
            <span className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
              Hoje, 19/02/2026
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Receita do dia</div>
              <div className="text-2xl font-bold text-gray-900">R$ 3.245,00</div>
              <div className="text-xs font-semibold text-primary mt-1 flex items-center gap-1">
                <i className="fas fa-arrow-up"></i> +12%
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Pedidos</div>
              <div className="text-2xl font-bold text-gray-900">47</div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                +8 em relação a ontem
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Ticket médio</div>
              <div className="text-2xl font-bold text-gray-900">R$ 69,04</div>
              <div className="text-xs font-semibold text-primary mt-1 flex items-center gap-1">
                <i className="fas fa-arrow-up"></i> +5%
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 border-l-4 border-l-accent">
              <div className="text-sm text-gray-500 mb-2">Estoque baixo</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs font-semibold text-accent mt-1 flex items-center gap-1">
                <i className="fas fa-exclamation-triangle"></i> atenção
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="px-8 pb-8">
            <h4 className="text-lg font-bold text-gray-800 mb-6">Vendas dos últimos 7 dias</h4>
            <div className="h-64 w-full" style={{ minHeight: '250px' }}>
              {/* @ts-ignore: Suppressing strict type check for minWidth if definition is missing, but required for runtime fix */}
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F766E" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer Mockup */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <i className="fas fa-chart-pie text-gray-400"></i> 
              Prato mais vendido: <span className="font-semibold text-gray-800">Salada Tropical (24 unidades)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};