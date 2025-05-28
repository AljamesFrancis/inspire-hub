"use client";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

const Sidenav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const menuItems = [
   
   
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) setIsMobileMenuOpen(false);
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#2b2b2b] text-[#d5ae85] shadow-md z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left Side - Logo or Title */}
        <Link href="/" className="text-xl font-bold">
          Log out
        </Link>

        {/* Middle - Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className="hover:text-blue-200 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side - Image */}
        <div className="hidden md:block">
          <Image
            src="/images/inspirelogo.png"
            alt="Partner Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-2xl"
          onClick={handleMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1e293b]">
          <ul className="py-2 px-4 space-y-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  className="block py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Sidenav;
