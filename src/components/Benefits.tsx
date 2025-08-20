import React from 'react';
import { benefitsData } from '../data/BenefitsData';

const Benefits: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-gray-900">
      <div className="max-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Por Que Escolher o <span className="text-green-400">ZapFlow?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A plataforma mais avançada de automação no-code em Moçambique, construída para empresas que querem resultados excepcionais.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefitsData.map((benefit, index) => (
            <div 
              key={index}
              className="group bg-black border border-green-500/20 rounded-2xl p-8 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-green-400 mb-6 group-hover:scale-110 group-hover:text-green-300 transition-all duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{benefit.title}</h3>
              <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
