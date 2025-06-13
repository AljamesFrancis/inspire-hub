"use client";

import React, { useEffect, useState } from "react";
// import Link from "next/link"; // Next.js specific Link component is not supported in this environment

const backgroundImages = [
  "/images/IMG_5268.jpg",
  "/images/IMG_5269.jpg",
  "/images/IMG_5270.jpg",
  "/images/IMG_5271.jpg",
  "/images/IMG_5272.jpg",
];

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Effect to change background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5000ms = 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once after initial render

  return (
    <div className="relative w-full h-screen overflow-hidden font-inter">
      {/* Overlay for background images */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-10">
        {/* Map through background images to create a carousel effect */}
        {backgroundImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Background ${index}`}
            // Dynamically apply opacity based on currentImageIndex
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-50 z-[-1]" : "opacity-0"
            }`}
          />
        ))}

        {/* Content section: aligned horizontally on desktop, vertically on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-between h-full px-6 md:px-16 relative z-20">
          {/* Text content and button container */}
          <div className="w-full md:w-1/2 text-white flex flex-col justify-center items-start text-left space-y-6">
            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome Home to <br className="hidden md:block" /> Inspire Hub
            </h1>
            {/* Supporting paragraph */}
            <p className="text-lg md:text-2xl max-w-xl">
              The community, workspaces, and technology to make a good
              impression and get down to business.
            </p>
            {/* "Book a Visit" button using a standard <a> tag for navigation */}
            <a href="/main">
              <button className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Book a Visit
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
