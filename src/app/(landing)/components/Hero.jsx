"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // Add this at the top
const backgroundImages = [
  "/images/IMG_5268.jpg",
  "/images/IMG_5269.jpg",
  "/images/IMG_5270.jpg",
  "/images/IMG_5271.jpg",
  "/images/IMG_5272.jpg",
];

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5000ms = 5 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-60 z-10">
        {backgroundImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Background ${index}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-50 z-[-1]" : "opacity-0"
            }`}
          />
        ))}
        <div className="flex flex-col md:flex-row items-center justify-between h-full px-6 md:px-16">
          <div className="w-full md:w-1/2 text-white flex flex-col justify-center items-start text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome Home to <br className="hidden md:block" /> Inspire Hub
            </h1>
            <p className="text-lg md:text-2xl max-w-xl">
              The community, workspaces, and technology to make a good
              impression and get down to business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

{
  /* <div className="flex flex-col md:flex-row items-center justify-between h-full px-6 md:px-16">
<div className="w-full md:w-1/2 text-white flex flex-col justify-center items-start text-left space-y-6">
  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
    Welcome Home to <br className="hidden md:block" /> Inspire Hub
  </h1>
  <p className="text-lg md:text-2xl max-w-xl">
    The community, workspaces, and technology to make a good impression and get down to business.
  </p>
  <button className="bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-3 px-8 rounded-lg shadow-lg">
    Learn about us
  </button>
</div>
</div> */
}
