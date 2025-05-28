import React from 'react';
import {
  FaBehance,
  FaDribbble,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#2b2b2b] text-[#d5ae85] px-6 py-20 md:px-16">
      {/* FAQ Section */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-10">FAQ</h2>
        <ul className="space-y-4 border-b border-[#333] pb-10">
          <li className="cursor-pointer hover:underline">
            Is there a best time of year to buy a home?
          </li>
          <li className="cursor-pointer hover:underline">
            How much should I save for a downpayment?
          </li>
          <li className="cursor-pointer hover:underline">
            Do you work with clients in different timezones?
          </li>
          <li className="cursor-pointer hover:underline">
            What is the first step of the buying process?
          </li>
          <li className="cursor-pointer hover:underline">
            Do you work with startups?
          </li>
          <li className="cursor-pointer hover:underline">
            Should I buy instead of rent?
          </li>
        </ul>
      </div>

      {/* Contact Section */}
      <div className="max-w-5xl mx-auto mt-10">
        <h3 className="text-4xl font-semibold mb-4">You may contact us via email at:</h3>
        <p className="text-lg text-[#ccc] mb-10">inspireholdings@global.com</p>

        <p className="text-sm text-[#777] mb-10">Uptown mall 11th Avenue, corner 36th St, Taguig City, Metro Manila </p>

        {/* Footer Links and Icons */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm border-t border-[#333] pt-10">
          {/* Left Links */}
          <div className="flex flex-wrap gap-6 mb-6 md:mb-0">
            <a href="#" className="hover:underline">Work</a>
            <a href="#" className="hover:underline">Services</a>
            <a href="#" className="hover:underline">Blog</a>
            <a href="#" className="hover:underline">Clients</a>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4 text-white">
            <FaBehance />
            <FaDribbble />
            <FaInstagram />
            <FaLinkedin />
            <FaFacebookF/>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-xs text-[#666] mt-6">© 2012–2025 Inspire Holdings </p>
      </div>
    </footer>
  );
};

export default Footer;
