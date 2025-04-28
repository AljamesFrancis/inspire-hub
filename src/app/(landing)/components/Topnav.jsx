'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Signup from '../components/Signup'; // Make sure you import Signup modal component

export default function Topnav() {
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <nav
      className={`w-full fixed top-0 left-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
        scrolled ? 'bg-[#2b2b2b] shadow-md' : 'bg-transparent'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image
          src="/images/inspirelogo.png"
          alt="Website Logo"
          width={40}
          height={40}
        />
        <span className="text-white font-bold text-lg">Inspire Hub</span>
      </div>

      {/* Navigation Links */}
      <div className="space-x-6 flex items-center">
        <Link href="/about" className="text-white font-bold hover:text-blue-300 transition">
          About
        </Link>

        {/* Open the SignUp Modal on Click */}
        <button
          onClick={openModal}
          className="text-white font-bold hover:text-blue-300 transition"
        >
          Sign up
        </button>

        {/* Login Button with conditional styles */}
        <Link
          href="/login"
          className={`font-bold transition ${
            scrolled
              ? 'bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-orange-600'
              : 'text-white hover:text-blue-300'
          }`}
        >
          Login
        </Link>
      </div>

      {/* Render the Modal when isModalOpen is true */}
      {isModalOpen && <Signup closeModal={closeModal} />}
    </nav>
  );
}
