'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const images = [
  { 
    id: 1, 
    url: '/images/IMG_5296.jpg', 
    label: 'Boracay', 
    landingPage: '/meetingroom' // Your actual Nagoya landing page route
  },
  { 
    id: 2, 
    url: '/images/IMG_5338.jpg', 
    label: 'Siargao', 
    landingPage: '/meetingroom2' // Your actual Tokyo landing page route
  },
  { 
    id: 3, 
    url: '/images/IMG_5330.jpg', 
    label: 'El Nido', 
    landingPage: '/meetingroom3' // Your actual Yokohama landing page route
  },
  { 
    id: 4, 
    url: '/images/IMG_5283.jpg', 
    label: 'Coron', 
    landingPage: '/meetingroom4' // Your actual Osaka landing page route
  },
];

export default function FourImageFullScreen() {
  const router = useRouter();

  return (
    <div className="w-full h-screen grid grid-cols-2 grid-rows-2 gap-2">
      {images.map((img) => (
        <div key={img.id} className="relative group overflow-hidden">
          <img
            src={img.url}
            alt={img.label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
            <h2 className="text-white text-2xl font-bold mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {img.label}
            </h2>
            <button
              onClick={() => router.push(img.landingPage)}
              className="text-white px-6 py-2 rounded-full text-lg font-semibold shadow-[0_0_10px_rgba(255,255,255,0.8)] bg-black/60 hover:bg-black/80 transition-colors duration-300"
            >
              Book Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}