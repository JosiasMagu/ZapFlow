import React from 'react';
import { plansData } from '../data/PlansData';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-900 w-full">
      {/* Container full width */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Planos Que Escalam Com Seu <span className="text-green-400">Negócio</span>
          </h2>
          <p className="text-xl text-gray-300">
            Comece grátis e cresça sem limites com nossa automação em Moçambique
          </p>
        </div>

        {/* Grid que ocupa toda a largura */}
        <div className="grid md:grid-cols-3 gap-8 w-full">
          {plansData.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-green-500 text-black transform scale-105 shadow-2xl shadow-green-500/25'
                  : 'bg-black border border-green-500/20 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/10'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-900 text-green-100 px-4 py-1 rounded-full text-sm font-bold">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.highlighted ? 'text-green-900' : 'text-gray-300'}`}>
                  {plan.description}
                </p>
                <div className="mb-8">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.highlighted ? 'text-green-900' : 'text-gray-400'}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check className={`h-5 w-5 mr-3 ${plan.highlighted ? 'text-green-900' : 'text-green-400'}`} />
                    <span className={plan.highlighted ? 'text-green-900' : 'text-gray-300'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-full font-bold transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-black text-green-400 hover:bg-gray-900'
                    : 'bg-green-500 text-black hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105'
                }`}
              >
                Escolher {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
