import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { activeSocialLinks } from "@/constants/socialLinks";
import Image from "next/image";

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
} as const;

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-2xl flex gap-1 font-bold">
            <Image
            src="/logo.svg" 
            height={32}
            width={32}
            alt="Builders Liability Logo"
            priority
            />
              Builders Liability
            </Link>
            <p className="text-[1rem]">
              Protecting properties, and investments with comprehensive insurance solutions for a safer future.
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
              <li>Builders Liability Insurance</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="mb-2">+234 806 006 0826</p>
            <p className="mb-2">dsasore01@gmail.com</p>
            <p>Zone 6, Juba Street, Wuse, Development control Abuja</p>
            {activeSocialLinks().length > 0 && (
              <div className="flex space-x-4 mt-4">
                {activeSocialLinks().map((link) => {
                  const Icon = SOCIAL_ICONS[link.network];
                  return (
                    <a
                      key={link.network}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="hover:text-green-300 transition-colors"
                    >
                      <Icon aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} Builders-Liability. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
