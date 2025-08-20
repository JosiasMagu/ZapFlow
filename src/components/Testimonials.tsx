import React from "react";
import { testimonialsData } from "../data/TestimonialsData";
import { Star } from "lucide-react";
import defaultAvatar from "../assets/logo.jpeg"; 

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Casos de Sucesso Reais
          </h2>
          <p className="text-xl text-gray-300">
            Empresas em Moçambique que transformaram seus resultados com ZapFlow
          </p>
        </div>

        {/* Grid de Testemunhos */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-green-500/20 rounded-2xl p-8 
                         hover:border-green-400 hover:shadow-xl hover:shadow-green-500/10 
                         transition-all duration-300"
            >
              {/* Cabeçalho */}
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image || defaultAvatar} // Fallback se vazio
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-green-500/30"
                />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-green-400 text-sm">{testimonial.role}</p>
                </div>
              </div>

              {/* Estrelas */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-green-400 fill-green-400"
                  />
                ))}
              </div>

              {/* Comentário */}
              <p className="text-gray-300 italic leading-relaxed">
                "{testimonial.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
