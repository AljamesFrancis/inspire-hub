"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head"; // ✅ You need this import

export default function WelcomePage () {  return (
    <>
      <Head>
        <title>Welcome | MyApp</title>
        <meta name="description" content="Welcome to MyApp!" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to MyApp!</h1>
          <p className="text-lg mb-6">Your all-in-one platform to manage everything with ease.</p>
          <div className="flex justify-center space-x-4">
            <a
              href="/login"
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </>
  );
}



