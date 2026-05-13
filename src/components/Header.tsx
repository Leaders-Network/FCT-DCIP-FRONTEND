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
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  

  return (
    <header className="bg-white">
      {/* Top bar - NOT fixed */}
      <div className="bg-green-600 py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-white mr-1" />
                <span className="text-white text-[1rem]">Abuja, Nigeria 110111</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-white mr-1" />
                <span className="text-white text-[1rem]">Sunday-Friday 9am-8pm</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-white hover:text-green-600">
                <FaFacebookF size={18} />
              </a>
              <a href="#" className="text-white hover:text-green-600">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="text-white hover:text-green-600">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-white hover:text-green-600">
                <FaLinkedinIn size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation - FIXED to top when scrolled past 50px */}
      <nav className={`
    ${isScrolled ? 'fixed top-0 left-0 right-0 z-50' : ''}
    bg-white border-b border-gray-200
    shadow-lg
    transition-all duration-500 ease-in-out
    will-change-transform
  `}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl flex gap-1 font-bold text-green-600">
            <Image
            src="/logo.svg" 
            height={32}
            width={32}
            alt="Builders Liability Logo"
            priority
            />
              Builders Liability
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6 ">
              <Link href="/" className={`${pathname === '/' ? 'text-green-600 underline' : 'text-gray-600'} font-semibold text-[1.2rem] hover:text-green-600 hover:underline`}>
                Home
              </Link>
              <Link href="/about" className={`${pathname === '/about' ? 'text-green-600 underline' : 'text-gray-600'} font-semibold text-[1.2rem] hover:text-green-600 hover:underline`}>
                About
              </Link>
              <Link href="/faq" className={`${pathname === '/faq' ? 'text-green-600 underline' : 'text-gray-600'} font-semibold text-[1.2rem] hover:text-green-600 hover:underline`}>
                FAQ
              </Link>
              <Link href="/contact" className={`${pathname === '/contact' ? 'text-green-600 underline' : 'text-gray-600'} font-semibold text-[1.2rem] hover:text-green-600 hover:underline`}>
                Contact
              </Link>
            </div>

           

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-green-600 focus:outline-none"
              >
                {isMenuOpen ? <CgClose size={24} /> : <CgMenuLeft size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 text-[1.2rem] pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                Home
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                About
              </Link>
              <Link href="/faq" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                FAQ
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                Contact
              </Link>
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-semibold text-[1.2rem]">(234) 555-0129</span>
              </div>
             
            </div>
          </div>
        )}

      </nav>
    </header>
  );
};

export default Header;