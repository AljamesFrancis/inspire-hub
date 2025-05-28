"use client";

import React from "react";

const services = [
  {
    title: "Dedicated Desks",
    image: "/images/IMG_5275.jpg",
    description:
      "Enjoy a personal, reserved workspace in a dynamic environment—perfect for focused productivity with the flexibility of a shared office.",
    buttonLabel: "Learn more",
  },
  {
    title: "Small Office Space",
    image: "/images/IMG_5288.jpg",
    description:
      "Ideal for small teams, our private offices offer the perfect balance of privacy and community in a professional setting.",
    buttonLabel: "Learn more",
  },
  {
    title: "Medium Office Space",
    image: "/images/IMG_5284.jpg",
    description:
      "Designed for growing teams, our medium offices provide ample space, premium amenities, and a collaborative atmosphere to help your business thrive.",
    buttonLabel: "Learn more",
  },
];

const Desks = () => {
  return (
    <div className="bg-gray-100 py-16 px-6 md:px-20">
      {/* Intro Section */}
      <div className="w-full md:w-2/3 mx-auto mb-16">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-4">
          Flexible Workspaces for Modern Professionals
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed text-center">
          Whether you're a freelancer, a startup, or remote team, our beautifully furnished desks are ready to support your productivity.
          Enjoy a comfortable environment, and a vibrant community — all at an affordable rate.
        </p>
      </div>

      {/* Card Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden"
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{service.title}</h3>
              <hr className="border-gray-200 mb-4" />
              <p className="text-gray-700 text-base leading-relaxed mb-6 flex-1">
                {service.description}
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg mt-auto self-start">
                {service.buttonLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Desks;
