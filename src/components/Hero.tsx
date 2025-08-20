import React from 'react';
import { ArrowRight, Play, Star, Clock } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden w-full"
    >
      {/* Background Animations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-green-500/5 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Column */}
          <div className="text-center lg:text-left max-w-full">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Automatize
              <span className="text-green-400"> Seu Negócio</span>
              <br />
              Sem Complicações
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Conecte aplicativos, automatize tarefas e economize tempo em minutos.
              Transforme seu negócio digitalmente, sem precisar de código.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Criar Automação Grátis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center">
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </button>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-green-400 fill-current" />
                ))}
                <span className="ml-2">4.9/5 (3.2k avaliações)</span>
              </div>
              <div className="border-l border-gray-600 pl-6">
                <span>50.000+ automações criadas</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative w-full">
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-green-500/20 shadow-2xl shadow-green-500/10 p-8 transform hover:scale-105 transition-transform duration-500 w-full">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-black">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Automação Ativa</h3>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-900 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-semibold">Processando Leads...</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Leads Processados</span>
                      <span className="font-bold text-lg">2.847</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2 mt-2">
                      <div className="bg-green-900 h-2 rounded-full w-4/5 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Economia de Tempo</span>
                      <span className="font-bold text-lg">156h</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">Esta semana</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                {['Gmail', 'Slack', 'CRM'].map((app, i) => (
                  <div key={i} className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                    <div className="text-green-400 font-bold text-sm">{app}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
