import React from 'react';
import { ChevronRight } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-green-500 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            Pronto Para Automatizar Seu Sucesso?
          </h2>
          <p className="text-xl text-green-900 mb-8 leading-relaxed">
            Junte-se a mais de 50.000 empresas em Moçambique que já automatizaram seus processos. 
            Configure sua primeira automação em menos de 5 minutos.
          </p>
          <button className="group bg-black text-green-400 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-900 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto">
            Começar Automação Gratuita
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-green-900 mt-4 text-sm">
            ✓ Teste grátis por 14 dias  ✓ Sem cartão  ✓ Setup em 5 minutos  ✓ Suporte 24/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
