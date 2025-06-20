"use client";
import React, { useState } from 'react';
import { FaRobot, FaEnvelope, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";



const Footer = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  const steps = [
    {
      id: 'greet',
      message: 'Hello! Welcome to Inspire Holdings. How can I help you today?',
      trigger: 'options'
    },
    {
      id: 'options',
      options: [
        { value: 'workspace', label: 'Workspace inquiries', trigger: 'workspace' },
        { value: 'meeting', label: 'Meeting room booking', trigger: 'meeting' },
        { value: 'contact', label: 'Contact support', trigger: 'contact' }
      ]
    },
    {
      id: 'workspace',
      message: 'For dedicated workspace inquiries, please email info@inspireholdings.ph',
      end: true
    },
    {
      id: 'meeting',
      message: 'To book meeting rooms, please visit our booking page inspirehub.com',
      end: true
    },
    {
      id: 'contact',
      message: 'Our Office is available Mon-Fri 7AM-10PM. Would you like us to contact you?',
      trigger: 'contact-response'
    },
    {
      id: 'contact-response',
      options: [
        { value: 'yes', label: 'Yes, please contact me', trigger: 'get-email' },
        { value: 'no', label: 'No, thanks', trigger: 'end' }
      ]
    },
    {
      id: 'get-email',
      message: 'Please enter your email address:',
      trigger: 'email-input'
    },
    {
      id: 'email-input',
      user: true,
      validator: (value) => {
        if (/^\S+@\S+\.\S+$/.test(value)) {
          return true;
        }
        return 'Please enter a valid email';
      },
      trigger: 'confirm-email'
    },
    {
      id: 'confirm-email',
      message: 'Thank you! We will contact you shortly.',
      end: true
    },
    {
      id: 'end',
      message: 'Thank you for chatting with us!',
      end: true
    }
  ];

  return (
    <footer className="bg-[#2b2b2b] text-[#d5ae85] px-6 py-20 md:px-16">
      {/* FAQ Section */}
     

      {/* Contact Section */}
      <div className="w-full mx-auto mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-semibold mb-4 hover:underline hover:text-amber-500 transition-colors">You may contact us via email at:</h3>
            <p className="text-lg text-[#d5ae85] mb-2 hover:underline">info@inspireholdings.ph</p>
            <p className="text-lg text-[#d5ae85] mb-2 hover:underline">inspirenextglobal@gmail.com</p>
          </div>

          <div className="md:w-1/2 border-l-0 md:border-l-2 border-[#d5ae85] md:pl-8">
            <h3 className="text-2xl font-semibold mb-4 hover:underline hover:text-amber-500 transition-colors">Our Office Hours</h3>
            <p className="text-lg text-[#d5ae85] mb-2 hover:underline">Monday to Friday: 7:00 AM - 06:30 PM</p>
            <p className="text-lg text-[#d5ae85] mb-2 hover:underline">You may leave an email to us on Weekends!</p>
          </div>
        </div>
      </div>

      {/* Footer Links and Icons */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm border-t border-[#333] pt-10">
        <div className="flex flex-wrap gap-6 mb-6 md:mb-0">
          <a href="https://inspireholdings.ph/home" className="hover:underline">Work</a>
          <a href="https://inspireholdings.ph/upcoming-projects" className="hover:underline">Services</a>
          <a href="https://inspireholdings.ph/seminar-1" className="hover:underline">Blog</a>          
          <a href="https://inspireholdings.ph/home" className="hover:underline">About</a>
        </div>

        <div className="flex space-x-5 text-[#d5ae85]">
          <li className="cursor-pointer hover:underline">Inspire Holdings Inc.</li>
          <a href="https://www.instagram.com/inspire.holdings.inc/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
            <FaInstagram />
          </a>
          <a href="https://web.facebook.com/inspireholdings" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
            <FaFacebookF />
          </a>
          <a href="https://www.tiktok.com/@inspire.holdings" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
            <FaTiktok/>
          </a>
        </div>
     

                <div className="flex space-x-5 text-[#d5ae85]">
                  <li className="cursor-pointer hover:underline">
                          Inspire Next Global Inc.
                          </li>
                  <a href="https://www.instagram.com/inspirenextglobal_inc/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
                    <FaInstagram />
                  </a>
                  <a href="https://web.facebook.com/inspirenextglobalinc" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
                    <FaFacebookF />
                  </a>
                  <a href="https://www.tiktok.com/@inspirenextglobal" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
                    <FaTiktok/>
                  </a>
                </div>
        </div>
      <footer className="relative bg-[#2b2b2b] text-center py-6 mt-10">
        <p className="text-sm text-gray-600">&copy; 2020–2025 Inspire Holdings Inc & Inspire Next Global Inc.</p>

      </footer>
    </footer>
  );
};

export default Footer;