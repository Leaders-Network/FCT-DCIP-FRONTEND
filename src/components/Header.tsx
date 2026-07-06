'use client'
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';
import { CgMenuLeft, CgClose } from 'react-icons/cg';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="relative z-[60]">
      {/* Top bar - NOT fixed */}
      <div className="bg-[#028835] py-2 hidden md:block">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center text-xs font-medium">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-white/90">
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                <span>Abuja, Nigeria 110111</span>
              </div>
              <div className="flex items-center text-white/90">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span>Sunday-Friday 9am-8pm</span>
              </div>
            </div>
            <div className="flex items-center space-x-5">
              <a href="#" className="text-white/80 hover:text-white hover:scale-110 transition-all">
                <FaFacebookF size={14} />
              </a>
              <a href="#" className="text-white/80 hover:text-white hover:scale-110 transition-all">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="text-white/80 hover:text-white hover:scale-110 transition-all">
                <FaTwitter size={14} />
              </a>
              <a href="#" className="text-white/80 hover:text-white hover:scale-110 transition-all">
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation - FIXED to top when scrolled past 20px */}
      <nav 
        className={`
          transition-all duration-300 ease-in-out
          ${isScrolled 
            ? 'fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(15,23,42,0.08)] py-3' 
            : 'bg-white border-b border-gray-100 py-4'}
        `}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-green-50 flex items-center justify-center group-hover:shadow-md transition-shadow">
                <Image
                  src="/logo.svg" 
                  height={28}
                  width={28}
                  alt="Builders Liability Logo"
                  priority
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[1.3rem] leading-tight font-bold text-gray-900 tracking-tight">
                  Builders Liability
                </span>
                <span className="text-[10px] uppercase tracking-widest text-green-600 font-bold">
                  FCT-DCIP Portal
                </span>
              </div>
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <Link 
                  key={link.path}
                  href={link.path} 
                  className={`relative px-4 py-2 text-[0.95rem] font-semibold rounded-lg transition-colors overflow-hidden group
                    ${pathname === link.path ? 'text-green-700' : 'text-gray-600 hover:text-green-700'}
                  `}
                >
                  <span className="relative z-10">{link.name}</span>
                  {/* Subtle active/hover background */}
                  <div className={`absolute inset-0 bg-green-50 rounded-lg -z-10 transition-transform duration-300 ease-out origin-left
                    ${pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `} />
                </Link>
              ))}
            </div>

            {/* CTA Button & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center">
                <Link href="/login" className="flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-[0_4px_14px_0_rgba(2,136,53,0.39)] hover:shadow-[0_6px_20px_rgba(2,136,53,0.23)] hover:-translate-y-0.5 transition-all duration-200">
                  Login to Portal
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <CgClose size={24} /> : <CgMenuLeft size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 space-y-2 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl">
            {[
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
              { name: 'FAQ', path: '/faq' },
              { name: 'Contact', path: '/contact' }
            ].map((link) => (
              <Link 
                key={link.path}
                href={link.path} 
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors
                  ${pathname === link.path ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 mt-2 border-t border-gray-100">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full px-6 py-3 text-base font-bold text-white bg-green-600 rounded-xl shadow-md">
                Login to Portal
              </Link>
            </div>
            
            <div className="pt-4 flex items-center justify-center text-sm text-gray-500 font-medium">
              <Phone className="w-4 h-4 text-green-600 mr-2" />
              <span>+234 806 006 0826</span>
            </div>
          </div>
        </div>

      </nav>
    </header>
  );
};

export default Header;