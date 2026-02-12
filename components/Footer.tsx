import React from 'react';
import { useModal } from '../context/ModalContext';

export const Footer: React.FC = () => {
  const { openModal } = useModal();

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showDepoimentos = () => {
    openModal('O que dizem nossos clientes', (
      <div className="grid gap-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="italic text-gray-700 mb-3">"O RestroFlow salvou meu casamento e meu restaurante. Estávamos perdendo dinheiro sem saber onde. Hoje temos lucro real."</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">CM</div>
            <div>
              <p className="text-sm font-bold text-gray-900">Carlos Mendes</p>
              <p className="text-xs text-gray-500">Dono do Villa Grill</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="italic text-gray-700 mb-3">"A funcionalidade de estoque automático é mágica. Nunca mais compramos tomate em excesso."</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">JP</div>
            <div>
              <p className="text-sm font-bold text-gray-900">Júlia Pereira</p>
              <p className="text-xs text-gray-500">Gerente do Café Central</p>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const showSeguranca = () => {
    openModal('Segurança e Privacidade', (
      <div>
        <p className="mb-4">No RestroFlow, levamos a segurança dos seus dados a sério. Utilizamos as melhores práticas do mercado:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Criptografia Ponta a Ponta:</strong> Todos os dados são transmitidos via SSL/TLS (HTTPS).</li>
          <li><strong>Backups Diários:</strong> Seus dados são salvos automaticamente todos os dias em servidores redundantes.</li>
          <li><strong>Conformidade:</strong> Seguimos as diretrizes da LGPD para proteção de dados pessoais.</li>
          <li><strong>Controle de Acesso:</strong> Você define exatamente o que cada funcionário pode ver ou editar.</li>
        </ul>
      </div>
    ));
  };

  const showAPI = () => {
    openModal('API para Desenvolvedores', (
      <div>
        <p className="mb-4">O RestroFlow possui uma API RESTful completa disponível para clientes do plano <strong>Premium</strong>.</p>
        <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm mb-4">
          GET /api/v1/orders<br/>
          Authorization: Bearer YOUR_API_KEY
        </div>
        <p>Com nossa API você pode:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Integrar com seu site próprio de delivery.</li>
          <li>Conectar com sistemas de contabilidade externos.</li>
          <li>Criar dashboards personalizados.</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">Consulte nosso suporte para obter a documentação técnica completa (Swagger).</p>
      </div>
    ));
  };

  const showHelpCenter = () => {
    openModal('Central de Ajuda', (
      <div>
        <p className="mb-4">Precisa de ajuda? Nossa equipe está pronta para te atender.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 p-4 rounded-lg hover:border-primary cursor-pointer transition-colors">
            <i className="fas fa-book text-primary mb-2 text-xl"></i>
            <h4 className="font-bold">Guia Rápido</h4>
            <p className="text-sm text-gray-500">Aprenda a configurar seu cardápio em 5 minutos.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg hover:border-primary cursor-pointer transition-colors">
            <i className="fas fa-video text-primary mb-2 text-xl"></i>
            <h4 className="font-bold">Tutoriais em Vídeo</h4>
            <p className="text-sm text-gray-500">Passo a passo de todas as funcionalidades.</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg hover:border-primary cursor-pointer transition-colors">
            <i className="fas fa-question-circle text-primary mb-2 text-xl"></i>
            <h4 className="font-bold">FAQ</h4>
            <p className="text-sm text-gray-500">Perguntas frequentes sobre pagamentos e planos.</p>
          </div>
        </div>
      </div>
    ));
  };

  const showDocs = () => {
    openModal('Documentação', (
      <div>
        <p>Acesse nossa base de conhecimento completa. Manuais detalhados para:</p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>Configuração de impressoras térmicas (USB/Rede).</li>
          <li>Cadastro de insumos e fichas técnicas.</li>
          <li>Gestão de múltiplos caixas.</li>
          <li>Fechamento de turno e sangria.</li>
        </ul>
      </div>
    ));
  };

  const showStatus = () => {
    openModal('Status do Sistema', (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-lg font-bold text-green-700">Todos os sistemas operacionais</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span>API Gateway</span>
            <span className="text-green-600 font-medium text-sm">Online (99.99%)</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span>Dashboard Web</span>
            <span className="text-green-600 font-medium text-sm">Online (100%)</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span>Processamento de Pedidos</span>
            <span className="text-green-600 font-medium text-sm">Online (99.95%)</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span>Servidor de Banco de Dados</span>
            <span className="text-green-600 font-medium text-sm">Online (100%)</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-right">Última atualização: Agora mesmo.</p>
      </div>
    ));
  };

  return (
    <footer id="contato" className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 font-display font-extrabold text-2xl text-white mb-6">
              <i className="fas fa-fire text-accent"></i> RestroFlow
            </div>
            <p className="text-gray-400 leading-relaxed mb-8">
              A plataforma SaaS que transforma restaurantes em máquinas de lucro. Menos caos. Mais controle. Mais lucro.
            </p>
            <div className="flex gap-4">
              {['facebook-f', 'instagram', 'linkedin-in', 'youtube'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label={`Follow us on ${social}`}
                >
                  <i className={`fab fa-${social}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Produto</h4>
            <ul className="space-y-3">
              <li><button onClick={() => handleScroll('solucoes')} className="text-gray-400 hover:text-white transition-colors text-left">Funcionalidades</button></li>
              <li><button onClick={() => handleScroll('precos')} className="text-gray-400 hover:text-white transition-colors text-left">Planos</button></li>
              <li><button onClick={showDepoimentos} className="text-gray-400 hover:text-white transition-colors text-left">Depoimentos</button></li>
              <li><button onClick={showSeguranca} className="text-gray-400 hover:text-white transition-colors text-left">Segurança</button></li>
              <li><button onClick={showAPI} className="text-gray-400 hover:text-white transition-colors text-left">API</button></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Suporte</h4>
            <ul className="space-y-3">
              <li><button onClick={showHelpCenter} className="text-gray-400 hover:text-white transition-colors text-left">Central de ajuda</button></li>
              <li><button onClick={showDocs} className="text-gray-400 hover:text-white transition-colors text-left">Documentação</button></li>
              <li><button onClick={showStatus} className="text-gray-400 hover:text-white transition-colors text-left">Status do sistema</button></li>
              <li><button onClick={() => handleScroll('contato')} className="text-gray-400 hover:text-white transition-colors text-left">Contato</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contato@restroflow.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <i className="far fa-envelope w-5"></i> contato@restroflow.com
                </a>
              </li>
              <li>
                <a href="tel:+258842104725" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <i className="fas fa-phone-alt w-5"></i> +258 84 210 4725
                </a>
              </li>
              <li className="text-gray-400 flex items-center gap-2">
                <i className="fas fa-map-marker-alt w-5"></i> Tete, Moçambique
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RestroFlow. Todos os direitos reservados. Feito com <i className="fas fa-heart text-accent mx-1"></i> para restaurantes.
        </div>
      </div>
    </footer>
  );
};