import React from 'react';
import { FaRobot } from "react-icons/fa";
import { FaEnvelope } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md'; // Material Design email icon

import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
} from 'react-icons/fa';
 
const Footer = () => {
  return (
    <footer className="bg-[#2b2b2b] text-[#d5ae85] px-6 py-20 md:px-16">
      {/* FAQ Section */}
      <div className="md:w-1/2 border-l-0 md:border-l-2 border-[#d5ae85] md:pl-8">
        <h2 className="text-2xl font-semibold mb-1 hover:text-amber-500 transition-colors">FAQs</h2>
        <ul className="space-y-4 border-b border-[#333] pb-5 ">
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
                    <div className="w-full mx-auto mt-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column - Contact Email */}
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-semibold mb-4 hover:underline hover:text-amber-500 transition-colors">You may contact us via email at:</h3>
                    <p className="text-lg text-[#d5ae85] mb-2 hover:underline">info@inspireholdings.ph</p>
                    <p className="text-lg text-[#d5ae85] mb-2 hover:underline">inspirenextglobal@gmail.com</p>
                  </div>

                  {/* Right Column - Additional Information */}
                  <div className="md:w-1/2 border-l-0 md:border-l-2 border-[#d5ae85] md:pl-8">
                    <h3 className="text-2xl font-semibold mb-4 hover:underline hover:text-amber-500 transition-colors">Our Office Hours</h3>
                    <p className="text-lg text-[#d5ae85] mb-2 hover:underline">Monday to Friday: 7:00 AM - 10:00 PM</p>
                    <p className="text-lg text-[#d5ae85] mb-2 hover:underline">You may leave a email to us in Weekends!</p>
                  
                    
                    <h3 className="text-2xl font-semibold mt-6 mb-4 hover:underline hover:text-amber-500 transition-colors">Visit Us</h3>
                    <p className="text-lg text-[#d5ae85] hover:underline " >6F Alliance Global Tower, 11th Avenue,</p>
                    <p className="text-lg text-[#d5ae85] hover:underline">corner 36th St, Taguig, Metro Manila</p>
                  </div>
                </div>
              </div>
                      

        <p className="mb-10"> </p>

        {/* Footer Links and Icons */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm border-t border-[#333] pt-10">
          {/* Left Links */}
          <div className="flex flex-wrap gap-6 mb-6 md:mb-0">
            <a href="https://inspireholdings.ph/home" className="hover:underline">Work</a>
            <a href="https://inspireholdings.ph/upcoming-projects" className="hover:underline">Services</a>
            <a href="https://inspireholdings.ph/seminar-1" className="hover:underline">Blog</a>          
            <a href="https://inspireholdings.ph/home" className="hover:underline">About</a>
          </div>

          {/* Social Icons */}
                <div className="flex space-x-5 text-[#d5ae85]">
                  <li className="cursor-pointer hover:underline">
                          Inspire Holdings Inc.
                          </li>
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

                  <a
              href="#"
              className="fixed bottom-10 right-6 bg-[#d5ae85] text-black p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
              title=" Chat with Inspire Team!"
            >
              <FaEnvelope size={24} />
            </a>

    </footer>

    </footer>
  );
};

export default Footer;
