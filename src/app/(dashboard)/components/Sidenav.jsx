"use client";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Sidenav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
        scrolled ? 'bg-[#2b2b2b] shadow-md' : 'bg-transparent'
      }`}>
        {/* Logo flex left */}
        <div className="flex items-center space-x-2">
          <Image
            src="/images/inspirelogo.png"
            alt="Website Logo"
            width={40}
            height={40}
          />
          <span className="text-white font-bold text-lg">Inspire Hub</span>
        </div>

        {/* Home button & Mobile Toggle - Flex right */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-white font-semibold hover:text-blue-300 transition px-4 py-2 rounded-lg"
          >
            Home
          </Link>
          {/* Mobile Toggle Button */}
          <button
            className="md:hidden text-xl sm:text-2xl focus:outline-none"
            onClick={handleMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1e293b] animate-slideDown fixed w-full top-20 z-50 shadow-lg">
          <ul className="py-2 px-4 space-y-2">
            <li>
              <Link
                href="/"
                className="w-full block text-left py-2 px-3 rounded hover:bg-blue-700 transition-colors text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Sidenav;