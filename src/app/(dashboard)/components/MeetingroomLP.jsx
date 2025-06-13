'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// Add price and a roomKey (for URL param) for each room
const images = [
  { 
    id: 1, 
    url: '/images/IMG_5296.jpg', 
    label: 'Boracay', 
    price: 2800,
    roomKey: 'boracay',
    landingPage: '/meetingroom?room=boracay'
  },
  { 
    id: 2, 
    url: '/images/IMG_5338.jpg', 
    label: 'Siargao', 
    price: 11000,
    roomKey: 'siargao',
    landingPage: '/meetingroom?room=siargao'
  },
  { 
    id: 3, 
    url: '/images/IMG_5330.jpg', 
    label: 'El Nido', 
    price: 4300,
    roomKey: 'elnido',
    landingPage: '/meetingroom?room=elnido'
  },
  { 
    id: 4, 
    url: '/images/IMG_5283.jpg', 
    label: 'Coron', 
    price: 1450,
    roomKey: 'coron',
    landingPage: '/meetingroom?room=coron'
  },
];

export default function FourImageFullScreen() {
  const router = useRouter();

  return (
    <div className="w-full h-screen grid grid-cols-2 grid-rows-2 gap-2 relative"> {/* Added 'relative' here */}
      
      {/* Back Button */}
      <button
        onClick={() => router.push('/main')}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/60 text-white rounded-full text-sm font-semibold hover:bg-black/80 transition-colors duration-300 shadow-lg mt-15"
      >
        Back
      </button>

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
            <span className="text-white text-lg mb-2 bg-black/60 rounded px-4 py-1">
              ₱{img.price.toLocaleString()}
            </span>
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