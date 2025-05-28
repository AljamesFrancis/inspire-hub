"use client";
import React, { useState, useEffect } from 'react';

import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const TopNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const menuItems = [
    
    
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
; 

const Sidenav = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const menuItems = [
    { name: 'Home', path: '/main' },
    { name: 'Book', path: '/booking' },
    { name: 'Reservation', path: '/reservation' },
    { name: 'Reservation History', path: '/reservationHistory' },
    { name: 'Billing', path: '/billing' },
    { name: 'Profile', path: '/profile' },
    { name: 'Logout', path: '/' },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);

  };

  useEffect(() => {
    const handleResize = () => {

      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileMenuOpen(false);
      }

      setIsDesktop(window.innerWidth > 768);

    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <header className="fixed top-0 left-0 right-0 bg-[#2b2b2b] text-[#d5ae85] shadow-md z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left Side - Main Logo */}
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

        {/* Right Side - Secondary Logo */}
        <div className="hidden md:block">
          <Image
            src="/images/inspirelogo.png" // Update with your logo path
            alt="Partner Logo"
            width={120} // Adjust as needed
            height={40} // Adjust as needed
            className="h-8 w-auto" // Maintain aspect ratio
          />
        </div>
        

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl"
          onClick={handleMobileMenuToggle}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800">
          <ul className="py-2 px-4 space-y-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.path}
                  className="block py-2 hover:bg-blue-700 px-3 rounded transition-colors"
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


  const isExpanded = isHovered || isOpen;

  return (
    <div
      className="fixed top-0 left-0 h-full flex flex-col items-center py-4 z-50"
      style={{
        width: isExpanded ? '200px' : '60px',
        backgroundColor: isExpanded
          ? 'rgba(31, 41, 55, 1)'
          : 'rgba(31, 41, 55, 0)',
        transition: 'width 0.3s ease, background-color 0.3s ease',
      }}
      onMouseEnter={() => {
        if (isDesktop) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (isDesktop) setIsHovered(false);
      }}
    >
      {/* Hamburger Icon (only when not expanded) */}
      {!isExpanded && (
        <>
          {/* Mobile Hamburger */}
          <button
            onClick={handleToggle}
            className="md:hidden text-white text-2xl mb-8"
          >
            <FaBars />
          </button>
  
          {/* Desktop Hamburger */}
          <div className="hidden md:block">
            <FaBars className="text-white text-2xl mb-8" />
          </div>
        </>
      )}
  
      <ul className="flex flex-col gap-6 mt-10">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`text-white text-sm font-medium ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-200`}
          >
            <Link href={item.path}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
  
};

export default Sidenav;

