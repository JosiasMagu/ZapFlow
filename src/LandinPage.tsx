import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';

const LandingPage: React.FC = () => {
  // Estado para controlar se o menu mobile está aberto
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estado para controlar se a página foi scrollada
  const [scrolled, setScrolled] = useState(false);

  // Detecta scroll para mudar estilo da Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navbar 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        scrolled={scrolled} 
      />
      <Hero />
      <Benefits />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
};

export default LandingPage;
