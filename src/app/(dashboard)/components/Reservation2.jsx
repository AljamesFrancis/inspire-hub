import React, { useState } from "react";

import { db } from "../../../../script/firebaseConfig";
import { collection, addDoc ,serverTimestamp} from "firebase/firestore";

const initialTimeSlots = [
  { time: "07", status: "available" },
  { time: "08", status: "available" },
  { time: "09", status: "available" },
  { time: "10", status: "available" },
  { time: "11", status: "available" },
  { time: "12", status: "busy" },
  { time: "13", status: "available" },
  { time: "14", status: "available" },
  { time: "15", status: "available" },
  { time: "16", status: "available" },
  { time: "17", status: "available" },
  { time: "18", status: "available" },
  { time: "19", status: "after-hours" },
  { time: "20", status: "after-hours" },
  { time: "21", status: "after-hours" },
];

const statusStyles = {
  available: "bg-white border border-gray-300 cursor-pointer",
  selected: "bg-orange-400 border border-gray-300 cursor-pointer",
  busy: "bg-gray-500 border border-gray-300 cursor-not-allowed",
  "after-hours":
    "bg-gray-200 border border-gray-300 bg-[repeating-linear-gradient(45deg,_#ccc_0,_#ccc_5px,_#fff_5px,_#fff_10px)] cursor-not-allowed",
};

const toMilitaryTime = (timeStr) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours);
  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

export default function TimeSlotSchedule() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    duration: "",
    guests: 0,
    specialRequests: "",
  });

  const [slots, setSlots] = useState(initialTimeSlots);

 const updateSelectedSlots = (startTime, duration) => {
  const startHour = parseInt(toMilitaryTime(startTime).split(":")[0]);
  const durationHours = parseInt(duration);
  const endHour = startHour + durationHours;

  // Generate a new set of slot statuses
  const newSlots = slots.map((slot) => {
    const slotHour = parseInt(slot.time);

    // Highlight selected range if available
    if (
      slotHour >= startHour &&
      slotHour < endHour &&
      slot.status === "available"
    ) {
      return { ...slot, status: "selected" };
    }

    // Clear previously selected slots outside new range
    if (
      slot.status === "selected" &&
      (slotHour < startHour || slotHour >= endHour)
    ) {
      return { ...slot, status: "available" };
    }

    return slot;
  });

  // ✅ Validate against updated newSlots instead of outdated old slots
  const invalidOverlap = newSlots.some((slot) => {
    const slotHour = parseInt(slot.time);
    return (
      slotHour >= startHour &&
      slotHour < endHour &&
      (slot.status === "busy" || slot.status === "after-hours")
    );
  });

  if (invalidOverlap) {
    alert(
      `Selected time overlaps with busy or after-hours.\n\nAvailable booking hours:\n- Morning: 07:00 AM to 12:00 PM\n- Afternoon: 01:00 PM to 06:00 PM`
    );
    return; // Prevent applying invalid selection
  }

  setSlots(newSlots); // ✅ Apply only if valid
};


  const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedFormData);

    if (e.target.name === "time" || e.target.name === "duration") {
      setTimeout(() => {
        updateSelectedSlots(
          e.target.name === "time" ? e.target.value : updatedFormData.time,
          e.target.name === "duration"
            ? e.target.value
            : updatedFormData.duration
        );
      }, 0);
    }
  };

  const handleGuestChange = (amount) => {
    setFormData((prev) => ({
      ...prev,
      guests: Math.max(0, prev.guests + amount),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Get all selected time slots
    const selectedSlots = slots
      .filter((slot) => slot.status === "selected")
      .map((s) => s.time)
      .join(", ");
  
    // Convert time to 24-hour format
    const militaryTime = toMilitaryTime(formData.time);
  
    // Prepare the data object to save
    const reservationData = {
      ...formData,
      time: militaryTime,
      selectedSlots,
      timestamp: new Date() // Server timestamp if needed: serverTimestamp()
    };
  
    try {
      // Save to Firestore under "meeting room" collection
      await addDoc(collection(db, "meeting room"), reservationData);
  
      alert("Reservation saved to Firebase!");
  
      // Reset form and slots after successful submit
      setFormData({
        name: "",
        email: "",
        date: "",
        time: "",
        duration: "",
        guests: "",
        specialRequests: "",
      });
  
      setSlots(initialTimeSlots); // Reset slot selection
    } catch (error) {
      console.error("Error adding reservation: ", error);
      alert("Failed to save reservation. Please try again.");
    }
  };

  const handleSlotClick = (index) => {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index && slot.status === "available"
          ? { ...slot, status: "selected" }
          : i === index && slot.status === "selected"
          ? { ...slot, status: "available" }
          : slot
      )
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Meeting Room 2 (Good for 12 Pax Php 1,500 / hr.)</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium">Starts at</label>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Select Time --</option> {/* Default blank option */}
            <option value="07:00 AM">07:00 AM</option>
            <option value="08:00 AM">08:00 AM</option>
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="01:00 PM">01:00 PM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="03:00 PM">03:00 PM</option>
            <option value="04:00 PM">04:00 PM</option>
            <option value="05:00 PM">05:00 PM</option>
            <option value="06:00 PM">06:00 PM</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium">Duration</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Select Duration --</option> {/* Default blank option */}
            <option value="8 hrs">8 hrs</option>
            <option value="7 hrs">7 hrs</option>
            <option value="6 hrs">6 hrs</option>
            <option value="5 hrs">5 hrs</option>
            <option value="4 hrs">4 hrs</option>
            <option value="3 hrs">3 hrs</option>
            <option value="2 hrs">2 hrs</option>
            <option value="1 hrs">1 hrs</option>
          </select>
        </div>
      </form>

      {/* Time Slots */}
      <div className="flex items-end space-x-1 mb-2">
        <span className="text-sm">06:00AM</span>
        <div className="flex border-black border-1 border-solid">
          {slots.map((slot, idx) => (
            <button
              key={idx}
              onClick={() => handleSlotClick(idx)}
              className={`w-12 h-12 text-sm flex items-center justify-center border-none ${statusStyles[slot.status]}`}
              type="button"
            >
              {slot.time}
            </button>
          ))}
        </div>
        <span className="text-sm">22:00PM</span>
      </div>

      {/* Legend */}
      <div className="flex space-x-4 text-sm mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 mr-1"></div>
          Available
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-400 border border-gray-300 mr-1"></div>
          Selected
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-500 border border-gray-300 mr-1"></div>
          Busy
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 bg-[repeating-linear-gradient(45deg,_#ccc_0,_#ccc_5px,_#fff_5px,_#fff_10px)] mr-1"></div>
          After hours (charges apply)
        </div>
      </div>

     

      {/* Guests and Special Requests */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Add guests</label>
          <div className="flex items-center space-x-2 mt-1">
            <button
              type="button"
              onClick={() => handleGuestChange(-1)}
              className="px-2 py-1 border rounded"
            >
              -
            </button>
            <span>{formData.guests}</span>
            <button
              type="button"
              onClick={() => handleGuestChange(1)}
              className="px-2 py-1 border rounded"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Special requests</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="e.g. have my guests wait in reception"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reserve Now
        </button>
      </div>
    </div>
  );
}
