"use client";

import React, { Suspense } from "react";
import Reservation from "../components/Reservation";

function ReservationFallback() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-20">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold">Loading Meeting Room...</h1>
        </div>
        <div className="p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <div>
      <Suspense fallback={<ReservationFallback />}>
        <Reservation />
      </Suspense>
    </div>
  );
}




