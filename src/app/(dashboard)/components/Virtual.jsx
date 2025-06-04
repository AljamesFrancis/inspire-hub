"use client";
import React, { useState } from "react";

const BookSeatsForm = () => {
  const [form, setForm] = useState({
    date: "",
    time: "",
    phone: "",
    area: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md space-y-6 mt-20 mb-20"
    > <h1 className="text-2x1 font-bold">I Hub Virtual Rooms</h1>
      <h2 className=" font-bold">Book Rooms</h2>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block font-medium text-gray-800 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Time */}
      <div>
        <label htmlFor="time" className="block font-medium text-gray-800 mb-1">
          Time
        </label>
        <input
          type="time"
          id="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="w-full border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block font-medium text-gray-800 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Area */}
      <div>
        <label htmlFor="area" className="block font-medium text-gray-800 mb-1">
          Area
        </label>
        <select
          id="area"
          name="area"
          value={form.area}
          onChange={handleChange}
          className="w-full border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select an area</option>
          <option value="balcony">Balcony</option>
          <option value="center">Center</option>
          <option value="aisle">Aisle</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition"
      >
        Book Now
      </button>
    </form>
  );
};

export default BookSeatsForm;
