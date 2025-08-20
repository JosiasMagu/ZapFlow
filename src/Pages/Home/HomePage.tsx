// src/pages/Home/HomePage.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SiteNavbar from '../../Layouts/SiteNavbar';
import Hero from '../../components/Hero';
import Benefits from '../../components/Benefits';
import Testimonials from '../../components/Testimonials';
import Pricing from '../../components/Pricing';
import CTA from '../../components/CTA';
import SiteFooter from '../../Layouts/SiteFooter';

export default function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash]);

  return (
    <>
      <SiteNavbar />
      <main>
        <Hero />
        <Benefits />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <SiteFooter />
    </>
  );
}
