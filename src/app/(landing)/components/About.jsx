"use client";

import React, { useState, useEffect } from "react";

const images = [
  "/images/IMG_5296.jpg",
  "/images/IMG_5290.jpg",
  "/images/IMG_5285.jpg",
  "/images/IMG_5279.jpg",
  "/images/IMG_5275.jpg",
  "/images/IMG_5272.jpg",
  "/images/IMG_5330.jpg",
];

const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-200 py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
        
        {/* Smooth Transition Image Section */}
        <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] overflow-hidden">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`About Image ${index}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))}
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 mt-20">
            About Inspire Hub
          </h2>
          <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
            At Inspire Hub, we create environments where productivity meets
            comfort. Our co-working spaces are designed to empower
            professionals, entrepreneurs, and businesses to thrive in a
            collaborative and inspiring atmosphere.
          </p>

          
        </div>
      </div>
    </div>
  );
};

export default About;
