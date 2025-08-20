import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function SiteNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      scrolled={scrolled}
    />
  );
}
