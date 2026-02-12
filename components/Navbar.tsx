import React, { useState, useEffect } from 'react';
import { NavItem } from '../types';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '#home' },
  { label: 'Problemas', href: '#problemas' },
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Planos', href: '#precos' },
  { label: 'Contato', href: '#contato' },
];

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  
  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const { openLogin, openSignup } = useAuth();

  // Handle scroll effect for navbar background and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section detection
      const sections = NAV_ITEMS.map(item => item.href.substring(1));
      let current = '';
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section top is near the top of the viewport (with some offset)
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = sectionId;
            break;
          }
        }
      }
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- SWIPE LOGIC ---
  const minSwipeDistance = 50; // Minimum distance to be considered a swipe

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Logic to Close (Swipe Left)
    if (isLeftSwipe && isMobileMenuOpen) {
       setIsMobileMenuOpen(false);
    }

    // Logic to Open (Swipe Right from edge)
    // We only allow opening if the swipe started near the left edge (< 50px)
    if (isRightSwipe && !isMobileMenuOpen && touchStart < 50) {
       setIsMobileMenuOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
    return () => {
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }
  }, [touchStart, touchEnd, isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(targetId);
      closeMenu();
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a 
            href="#home" 
            onClick={(e) => scrollToSection(e, '#home')}
            className="flex items-center gap-2 font-display font-extrabold text-2xl text-primary"
          >
            <i className="fas fa-fire text-accent"></i> RestroFlow
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`font-medium transition-colors hover:text-primary relative ${
                  activeSection === item.href.substring(1) ? 'text-primary font-semibold' : 'text-gray-600'
                }`}
              >
                {item.label}
                {activeSection === item.href.substring(1) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"></span>
                )}
              </a>
            ))}
            <div className="flex items-center gap-4 ml-4">
              <button 
                onClick={openLogin} 
                className="px-6 py-2 rounded-full border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
              >
                Login
              </button>
              <button 
                onClick={openSignup} 
                className="px-6 py-2 rounded-full bg-primary text-white font-semibold shadow-md hover:bg-primary-light hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Começar grátis
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-2xl text-gray-800 focus:outline-none z-50 relative"
            onClick={toggleMenu}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay & Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-visibility duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        
        {/* Backdrop (Dark Overlay) */}
        <div 
          className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        ></div>

        {/* Drawer (Side Menu) */}
        <div 
          className={`absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-extrabold text-2xl text-primary">
              <i className="fas fa-fire text-accent"></i> RestroFlow
            </div>
            {/* Close button inside drawer just in case */}
            <button onClick={closeMenu} className="text-gray-400 hover:text-gray-600">
               <i className="fas fa-chevron-left text-xl"></i>
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex flex-col p-6 gap-2 overflow-y-auto flex-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`text-lg font-medium py-3 px-4 rounded-lg transition-colors ${
                  activeSection === item.href.substring(1) 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Drawer Footer (Actions) */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { openLogin(); closeMenu(); }} 
                className="w-full text-center px-6 py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => { openSignup(); closeMenu(); }}
                className="w-full text-center px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-md hover:bg-primary-light transition-colors"
              >
                Começar grátis
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};