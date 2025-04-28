"use client";
import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import Link from 'next/link'; 

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
      setIsDesktop(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
