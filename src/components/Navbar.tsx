import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import logo from '../assets/logo.jpeg'

export type NavbarProps = {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  scrolled: boolean
}

const Navbar: React.FC<NavbarProps> = ({ isMenuOpen, setIsMenuOpen, scrolled }) => {
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md border-b border-green-500/20' : 'bg-black/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#home" className="flex items-center">
              <img
                src={logo}
                alt="ZapFlow Moçambique"
                className="h-10 w-auto mr-3 rounded"
              />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                ZapFlow Moçambique
              </h1>
            </a>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
              Home
            </a>
            <a href="#services" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
              Serviços
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
              Preços
            </a>
            <a href="#contact" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
              Contato
            </a>
            <Link
              to="/login"
              className="ml-6 bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-200"
            >
              Login
            </Link>
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-green-400 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-green-500/20 animate-slide-down">
          <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col">
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-green-400 font-medium">
              Home
            </a>
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-green-400 font-medium">
              Serviços
            </a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-green-400 font-medium">
              Preços
            </a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-green-400 font-medium">
              Contato
            </a>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full mt-4 text-center bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
