import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, MessageSquare } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-black border-t border-green-500/20 text-white py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
          {/* Logo e descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-8 w-8 text-green-400 mr-2" />
              <h3 className="text-2xl font-bold text-white">
                ZapFlow
              </h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              A plataforma de automação no-code mais poderosa em Moçambique. 
              Conecte, automatize e escale sem escrever uma linha de código.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
              <Linkedin className="h-6 w-6 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Produto</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#home" className="hover:text-green-400 transition-colors">Automações</a></li>
              <li><a href="#services" className="hover:text-green-400 transition-colors">Integrações</a></li>
              <li><a href="#pricing" className="hover:text-green-400 transition-colors">Templates</a></li>
              <li><a href="#contact" className="hover:text-green-400 transition-colors">API</a></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Suporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Comunidade</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright e links */}
        <div className="border-t border-green-500/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 ZapFlow Moçambique. Todos os direitos reservados.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors text-center sm:text-left">Política de Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors text-center sm:text-left">Termos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors text-center sm:text-left">LGPD</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
