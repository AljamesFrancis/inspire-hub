'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Navigation Bar */}
      <header
  className={`fixed top-0 left-0 right-0 h-16 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
    scrolled ? 'bg-blue-100 shadow-md' : 'bg-blue-900'
  }`}
>

        {/* Left: Logo */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src="/images/inspirelogo.png" alt="Website Logo" width={40} height={40} />
            <span className="text-white font-bold text-lg">Inspire Hub</span>
          </div>
        </div>

        {/* Right: Navigation links */}
        <div className="flex space-x-6 items-center">
          {/* Dashboard Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/dashboard" className="text-white font-bold hover:text-blue-300 transition">
              � Dashboard
            </Link>
            <Link href="/schedvisit" className="text-white font-bold hover:text-blue-300 transition">
              👥 Schedule Visit
            </Link>
            <Link href="/tenants" className="text-white font-bold hover:text-blue-300 transition">
              📅 Tenants
            </Link>
            <Link href="/reports" className="text-white font-bold hover:text-blue-300 transition">
              📊 Reports
            </Link>
            <Link href="/settings" className="text-white font-bold hover:text-blue-300 transition">
              ⚙️ Settings
            </Link>
            <Link href="/seatmap" className="text-white font-bold hover:text-blue-300 transition">
              ⚙️ Map
            </Link>
          </div>

          {/* Account Links */}
          <div className="hidden md:flex space-x-6 items-center ml-4">
            <button className="text-white font-bold hover:text-blue-300 transition">Login</button>
          </div>

          {/* Mobile menu button (if you want to keep mobile functionality) */}
          <button className="md:hidden flex flex-col justify-center items-center w-8 h-8">
            <span className="block w-6 h-0.5 bg-gray-300 mb-1.5"></span>
            <span className="block w-6 h-0.5 bg-gray-300 mb-1.5"></span>
            <span className="block w-6 h-0.5 bg-gray-300"></span>
          </button>
        </div>
      </header>
    </>
  );
}