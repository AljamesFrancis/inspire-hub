"use client";

import React, { useState, useEffect } from "react";

const images = [
  "/images/IMG_5335.jpg",
  "/images/IMG_5337.jpg",
  "/images/IMG_5343.jpg",
  "/images/IMG_5344.jpg",
  "/images/IMG_5345.jpg",
  // Add more images as needed
];

const Complimentary = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center md:items-start gap-10">
        
        {/* Rotating Image Section */}
        <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] overflow-hidden">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Complimentary Image ${index}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))}
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 mt-20">
            Complimentary Amenities
          </h2>
          <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
            From high-speed internet to free coffee, our complimentary offerings
            ensure that you can focus on what truly matters—growing your
            business and connecting with others in a comfortable and productive
            environment.
          </p>

          <button className="bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-3 px-8 rounded-lg shadow-md">
            Explore Amenities
          </button>
        </div>
      </div>
    </div>
  );
};

export default Complimentary;
