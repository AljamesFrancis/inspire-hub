'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const images = [
  { id: 1, url: '/images/IMG_5296.jpg', label: 'Nagoya' },
  { id: 2, url: '/images/IMG_5338.jpg', label: 'Yokohama' },
  { id: 3, url: '/images/IMG_5330.jpg', label: 'Tokyo' },
  { id: 4, url: '/images/IMG_5283.jpg', label: 'Osaka' },
];

export default function FourImageFullScreen() {
  const router = useRouter(); 
  const handleClick = (label) => {
    router.push(`/meetingroom?Nagoya=${encodeURIComponent(label)}`); 
    
  };




  return (
    <div className="w-full h-screen grid grid-cols-2 grid-rows-2 gap-2">
      {images.map((img) => (
        <div key={img.id} className="relative group overflow-hidden">
          <img
            src={img.url}
            alt={img.label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <button
            onClick={() => handleClick(img.label)}
            className="absolute inset-0 flex items-center justify-center bg-opacity-30 hover:bg-opacity-50 transition duration-300"
          >
            <span className="text-white px-6 py-2 rounded-full text-lg font-semibold shadow-[0_0_10px_rgba(255,255,255,0.8)] bg-black/60">
              {img.label}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
