"use client";

import React from "react";

const images = [
  "/images/ace.png",
  "/images/alliance.png",
  "/images/ayalaland.png",
  "/images/brittany.png",
  "/images/fastcash.png",
  "/images/ingi.png",
  "/images/iprosperity.png",
  "/images/megaworld.png",
  "/images/robinsons.png",
  "/images/servecorp.png",
  "/images/shang.png",
  "/images/smdc.png",
  "/images/spire.png",
  "/images/unb.png",
  "/images/vistaland.png",
  // Add more images as needed
];

const PartnerCompanies = () => {
  return (
    <div className="text-center bg-white py-10 px-4">
      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 relative inline-block after:content-[''] after:block after:w-101 after:h-1 after:bg-yellow-300 after:mx-auto after:mt-2 mb-10">
        Our Trusted Partners
      </h1>

      {/* Marquee */}
      <div className="overflow-hidden">
        <div className="flex animate-marquee gap-8 w-max">
          {[...images, ...images].map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Partner ${index}`}
              className="h-16 sm:h-20 w-auto object-contain"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerCompanies;
