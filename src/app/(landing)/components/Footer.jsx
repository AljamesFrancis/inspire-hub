import React from 'react';
import { Globe } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-[#2b2b2b] text-[#d5ae85] py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-[#3c3c3c] pb-10">
        {/* Workspaces */}
        <div>
          <h3 className="font-bold mb-4">Workspaces</h3>
          <ul className="space-y-2">
            <li>Private offices</li>
            <li>Coworking</li>
            <li>Meeting rooms</li>
            <li>Virtual office</li>
            <li>Locations</li>
          </ul>
        </div>

        {/* Our company */}
        <div>
          <h3 className="font-bold mb-4">Our company</h3>
          <ul className="space-y-2">
            <li>About us</li>
            <li>Green initiatives</li>
            <li>Transparency</li>
            <li>Partners</li>
          </ul>
        </div>

        {/* Partners */}
        <div>
          <h3 className="font-bold mb-4">Partners</h3>
          <ul className="space-y-2">
            <li>Technology</li>
            <li>Community</li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="font-bold mb-4">Connect</h3>
          <ul className="space-y-2">
            <li>LinkedIn</li>
            <li>Twitter</li>
            <li>Facebook</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm mt-6">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <span>© Copyright Servcorp Limited 2025</span>
          <span>|</span>
          <span>Terms & conditions</span>
          <span>|</span>
          <span>Privacy policy</span>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>English (US)</span>
          <span>|</span>
          <span>简体中文</span>
          <span>Français</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
