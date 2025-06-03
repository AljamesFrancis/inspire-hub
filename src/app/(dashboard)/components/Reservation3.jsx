import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../../../script/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const initialTimeSlots = [
  { time: "07", status: "busy" },
  { time: "08", status: "available" },
  { time: "09", status: "available" },
  { time: "10", status: "available" },
  { time: "11", status: "available" },
  { time: "12", status: "available" },
  { time: "13", status: "available" },
  { time: "14", status: "available" },
  { time: "15", status: "available" },
  { time: "16", status: "available" },
  { time: "17", status: "after-hours" },
  { time: "18", status: "after-hours" },
  { time: "19", status: "after-hours" },
];

const statusStyles = {
  available: "bg-white border border-gray-300 cursor-pointer",
  selected: "bg-orange-400 border border-gray-300 cursor-pointer",
  busy: "bg-gray-500 border border-gray-300 cursor-not-allowed",
  "after-hours":"bg-gray-200 border border-gray-300 bg-[repeating-linear-gradient(45deg,_#ccc_0,_#ccc_5px,_#fff_5px,_#fff_10px)] cursor-pointer",
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
    guests: [],
    specialRequests: "",
  });

    const [slots, setSlots] = useState(initialTimeSlots);
  
  const updateSelectedSlots = (startTime, duration) => {
    const startHour = parseInt(toMilitaryTime(startTime).split(":")[0]);
    const durationHours = parseInt(duration);
    const endHour = startHour + durationHours;
  
    // Check if the booking goes beyond 7:00 PM (19:00)
    if (endHour > 20) {
      alert(
        `❌ Booking overlaps with time beyond 8:00 PM (20:00).\n\nAvailable booking hours:\n- Morning: 08:00 AM to 7:00 PM`
      );
      return;
    }
  
    const newSlots = slots.map((slot) => {
      const slotHour = parseInt(slot.time);
  
      // Highlight selected range if available or after-hours
      if (
        slotHour >= startHour &&
        slotHour < endHour &&
        (slot.status === "available" || slot.status === "after-hours")
      ) {
        return { ...slot, status: "selected" };
      }
  
      // Deselect previously selected slots if no longer in range
      if (
        slot.status === "selected" &&
        (slotHour < startHour || slotHour >= endHour)
      ) {
        return slot.time >= "17"
          ? { ...slot, status: "after-hours" }
          : { ...slot, status: "available" };
      }
  
      return slot;
    });
  
    const hasBusyConflict = newSlots.some((slot) => {
      const slotHour = parseInt(slot.time);
      return (
        slotHour >= startHour &&
        slotHour < endHour &&
        slot.status === "busy"
      );
    });
  
    const includesAfterHours = newSlots.some((slot) => {
      const slotHour = parseInt(slot.time);
      return slotHour >= startHour && slotHour < endHour && slotHour >= 17;
    });
  
    if (hasBusyConflict) {
      alert(
        `❌ Selected time overlaps with a busy slot.\n\nAvailable booking hours:\n- Morning: 08:00 AM to 7:00 PM`
      );
      return;
    }
  
    if (includesAfterHours) {
      alert(`⚠️ After hours (charges apply) for bookings from 5:00 PM to 7:00 PM.`);
    }
  
    setSlots(newSlots);
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  // Prevent selecting Saturday (6) or Sunday (1)
  if (name === "date") {
    const selectedDate = new Date(value);
    const day = selectedDate.getDay();
    if (day === 1 || day === 6) {
      alert("❌ Booking is not available on weekends (Saturday & Sunday).");
      return; // Skip updating form
    }
  }

  const updatedFormData = { ...formData, [name]: value };
  setFormData(updatedFormData);

  if (name === "time" || name === "duration") {
    setTimeout(() => {
      updateSelectedSlots(
        name === "time" ? value : updatedFormData.time,
        name === "duration" ? value : updatedFormData.duration
      );
    }, 0);
  }
};

  const addGuest = () => {
    setFormData(prev => ({ ...prev, guests: [...prev.guests, ""] }));
  };

  const removeGuest = (index) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const handleGuestNameChange = (index, value) => {
    setFormData(prev => {
      const updatedGuests = [...prev.guests];
      updatedGuests[index] = value;
      return { ...prev, guests: updatedGuests };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   const selectedSlots = slots
      .filter((slot) => slot.status === "selected")
      .map((s) => s.time)
      .join(", ");
  
    
    const militaryTime = toMilitaryTime(formData.time);

    const reservationData = {
      ...formData,
      time: militaryTime,
      selectedSlots,
      timestamp: new Date(),
      status: "pending"
    };

    try {
          // Save to Firestore under "meeting room" collection
          await addDoc(collection(db, "meeting room"), reservationData);
      
          alert("Reservation saved to Database!");
      
          // Reset form and slots after successful submit
          setFormData({
            name: "",
            email: "",
            date: "",
            time: "",
            duration: "",
            guests: 0,
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
      <h1 className="text-xl font-bold mb-4">Yokohama (Good for 14 Pax Php 4,300 / hr.)</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {/* Name and Email Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Date, Time, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Date</label>
              <DatePicker
              selected={formData.date ? new Date(formData.date) : null}
              onChange={(date) =>
                handleChange({
                  target: { name: "date", value: date.toISOString().split("T")[0] },
                })
              }
              filterDate={(date) => {
                const day = date.getDay(); // 0 = Sun, 6 = Sat
                if (day === 0 || day === 6) return false; // disable weekends
            
                const today = new Date();
                today.setHours(0, 0, 0, 0);
            
                // Calculate date 2 weekdays from now
                let weekdaysAdded = 0;
                let checkDate = new Date(today);
                while (weekdaysAdded < 2) {
                  checkDate.setDate(checkDate.getDate() + 1);
                  const checkDay = checkDate.getDay();
                  if (checkDay !== 0 && checkDay !== 6) weekdaysAdded++;
                }
            
                return date >= checkDate;
              }}
              minDate={new Date()} // Optional safeguard
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholderText="Select a date"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Starts at</label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Time</option>
              {Array.from({ length: 13 }, (_, i) => {
                const hour = i + 7;
                const ampm = hour >= 12 ? "PM" : "AM";
                const displayHour = hour > 12 ? hour - 12 : hour;
                return (
                  <option key={hour} value={`${displayHour}:00 ${ampm}`}>
                    {displayHour}:00 {ampm}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Duration</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Duration</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={`${i + 1} hrs`}>
                  {i + 1} hour{i !== 0 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Slots Display */}
        <div className="mt-6">
          <div className="flex items-end space-x-1 mb-2">
            <span className="text-sm">07:00AM</span>
            <div className="flex border-black border-1 border-solid">
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSlotClick(idx)}
                  className={`w-12 h-12 text-sm flex items-center justify-center border-none ${statusStyles[slot.status]}`}
                  disabled={slot.status === "busy"}
                >
                  {slot.time}
                </button>
              ))}
            </div>
            <span className="text-sm">20:00PM</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            {Object.entries(statusStyles).map(([status, style]) => (
              <div key={status} className="flex items-center">
                <div className={`w-4 h-4 mr-1 ${style}`}></div>
                {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
              </div>
            ))}
          </div>
        </div>

        {/* Guest Management */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Guest Names</label>
          {formData.guests.length > 0 && (
            <div className={`space-y-2 ${formData.guests.length >= 3 ? 'max-h-[140px] overflow-y-auto' : ''}`}>
              
              {formData.guests.map((guest, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={guest}
                    onChange={(e) => handleGuestNameChange(index, e.target.value)}
                    placeholder={`Guest ${index + 1} name`}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addGuest}
            className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            + Add Guest
          </button>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium">Special Requests</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="e.g. have my guests wait in reception"
            className="mt-1 block w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Reserve Now
        </button>
      </form>
    </div>
  );
}