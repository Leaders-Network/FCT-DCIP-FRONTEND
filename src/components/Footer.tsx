import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">FCT-DCIP</h3>
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
              euismod bibendum laoreet.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-green-300 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-green-300 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-green-300 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-green-300 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>Occupier Liability Insurance</li>
              <li>Builders Liability Insurance</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="mb-2">1-800-123-4567</p>
            <p className="mb-2">info@fct-dcip.ng</p>
            <p>Zone 6, Julia Street, Wuse, Abuja</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-green-300 transition-colors">
                <Facebook />
              </a>
              <a href="#" className="hover:text-green-300 transition-colors">
                <Twitter />
              </a>
              <a href="#" className="hover:text-green-300 transition-colors">
                <Instagram />
              </a>
              <a href="#" className="hover:text-green-300 transition-colors">
                <Youtube />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} FCT-DCIP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
