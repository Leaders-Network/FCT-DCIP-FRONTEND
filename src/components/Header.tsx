import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; // Import the correct icons

import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import { CgMenuLeft } from 'react-icons/cg';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-green-600 mr-1" />
              <span>Abuja, Nigeria 110111</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-green-600 mr-1" />
              <span>Sunday-Friday 9am-8pm</span> {/* Updated time */}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="text-gray-600 cursor-pointer hover:text-green-600"
            >
              <FaFacebookF size={16} /> {/* Updated icon */}
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600">
              <FaInstagram size={16} color="currentColor" /> {/* Updated icon */}
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600">
              <FaTwitter size={16} color="currentColor" /> {/* Updated icon */}
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600">
              <FaLinkedinIn size={16} /> {/* Updated icon */}
            </a>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center">
              Get Started <span className="ml-2">→</span> {/* Added arrow */}
            </button>
          </div>
        </div>
      </div>
      <nav className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-green-600">
              FCT-DCIP
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-green-600">
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-green-600"
              >
                About
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-green-600">
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-green-600"
              >
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="font-semibold">(234) 555-0129</span>
              <span className="w-5 h-5 ">
                <FiSearch />
              </span>

              <span className="w-5 h-5  cursor-pointer">
                <CgMenuLeft />
              </span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;