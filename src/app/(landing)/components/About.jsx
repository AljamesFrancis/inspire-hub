import React from 'react';

const About = () => {
  return (
    <div className="bg-gray-200 py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
        
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <img
            src="/images/IMG_5296.jpg" // Replace with your actual image path
            alt="About Us"
            className="rounded-lg shadow-lg w-full object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 mt-20">
            About Inspire Hub
          </h2>
          <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
            At Inspire Hub, we create environments where productivity meets comfort.
            Our co-working spaces are designed to empower professionals, entrepreneurs, and businesses to thrive in a collaborative and inspiring atmosphere.
          </p>

          <button className="bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-3 px-8 rounded-lg shadow-md">
            Learn about the Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
