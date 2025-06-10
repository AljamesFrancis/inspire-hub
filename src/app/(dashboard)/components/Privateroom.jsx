"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiClock, FiPhone, FiArrowLeft, FiMapPin, FiSearch } from "react-icons/fi";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../script/firebaseConfig";
import { auth } from "../../../../script/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ROOMS_BY_AREA = {
  "BICOL": ["Bicol Room"],
  "CEBU": ["Cebu Room"],
  "PAMPANGA": ["Pampanga Room"],
  "NUEVA ECIJA": ["Nueva Ecija Room"],
  "PANGASINAN": ["Pangasinan Room"],
  "LAGUNA": ["Laguna Room"],
  "RIZAL": ["Rizal Room"],
  "BACOLOD": ["Bacolod Room"],
  "ILOILO": ["Iloilo Room"],
  "BATANGAS": ["Batangas Room"],
  "MINDORO": ["Mindoro Room"],
  "CAGAYAN DE ORO": ["Cagayan de Oro Room"],
  "QUEZON": ["Quezon Room"],
};

export default function BookingForm() {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [reservedRooms, setReservedRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isRoomOccupied, setIsRoomOccupied] = useState(false);
  const [occupiedRooms, setOccupiedRooms] = useState([]);

  const roomsForArea = ROOMS_BY_AREA[selectedArea] || [];

  useEffect(() => {
    const fetchOccupiedRooms = async () => {
      try {
        const q = query(
          collection(db, "privateOffice"),
          where("status", "in", ["reserved", "confirmed"])
        );
        const snapshot = await getDocs(q);
        const allOccupiedRooms = snapshot.docs.flatMap(doc => doc.data().selectedPO || []);
        setOccupiedRooms(allOccupiedRooms);
      } catch (error) {
        console.error("Error fetching occupied rooms:", error);
      }
    };

    fetchOccupiedRooms();
  }, []);

  useEffect(() => {
    const fetchReservedRooms = async () => {
      if (!selectedArea || !selectedDate || !selectedTime) return;
      const q = query(
        collection(db, "privateOffice"),
        where("area", "==", selectedArea),
        where("date", "==", selectedDate),
        where("time", "==", selectedTime),
        where("status", "in", ["reserved", "confirmed"])
      );
      const snapshot = await getDocs(q);
      const takenRooms = snapshot.docs.flatMap(doc => doc.data().selectedPO || []);
      setReservedRooms(takenRooms);
    };
    fetchReservedRooms();
  }, [selectedArea, selectedDate, selectedTime]);

  const handleRoomClick = (room) => {
    if (reservedRooms.includes(room) || occupiedRooms.includes(room)) return;
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const checkRoomStatus = (roomName) => {
    if (!roomName) return false;
    const foundArea = Object.entries(ROOMS_BY_AREA).find(([area]) =>
      area.toLowerCase() === roomName.toLowerCase()
    );
    if (!foundArea) {
      toast.info(`Room "${roomName}" was not found.`);
      setIsRoomOccupied(false);
      return;
    }
    const [areaName, rooms] = foundArea;
    const isOccupied = rooms.some(room => occupiedRooms.includes(room));
    const isReserved = rooms.some(room => reservedRooms.includes(room));
    setIsRoomOccupied(isOccupied || isReserved);
    if (isOccupied) {
      toast.error(`${areaName} is currently OCCUPIED.`);
    } else if (isReserved) {
      toast.error(`${areaName} is currently RESERVED.`);
    } else {
      toast.success(`${areaName} is AVAILABLE for viewing.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedArea || !selectedDate || !selectedTime || !phoneNumber || selectedRooms.length === 0) {
      toast.error("Please fill in all required fields.", { position: "top-center" });
      return;
    }
    setShowReceipt(true);
  };

  const handleFinalSubmit = async () => {
    try {
      const user = auth.currentUser;
      const userName = user ? (user.displayName || user.email) : "Anonymous";
      const userEmail = user ? user.email : "No Email";

      await addDoc(collection(db, "privateOffice"), {
        name: userName,
        email: userEmail,
        phone: phoneNumber,
        date: selectedDate,
        time: selectedTime,
        area: selectedArea,
        selectedPO: selectedRooms,
        timestamp: new Date(),
        status: "reserved",
      });

      toast.success("Reservation submitted!");
      setShowReceipt(false);
      setSelectedRooms([]);
      setSelectedArea("");
      setSelectedDate("");
      setSelectedTime("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error submitting reservation:", error);
      toast.error("Failed to submit reservation.");
    }
  };

  const filteredAreas = Object.keys(ROOMS_BY_AREA).filter(area =>
    area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ROOMS_BY_AREA[area].some(room =>
      room.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const isRoomReserved = (room) => {
    return reservedRooms.includes(room);
  };

  const isAreaOccupied = (area) => {
    return ROOMS_BY_AREA[area].some(room => occupiedRooms.includes(room));
  };

  const isAreaReserved = (area) => {
    return ROOMS_BY_AREA[area].some(room => reservedRooms.includes(room));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 mt-20">
      <a
        href="/main"
        className="mb-4 flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Back
      </a>
      <ToastContainer />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Booking Form */}
        <div className="md:w-1/2 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-2xl font-bold">Private Room Reservation</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
              <div className="flex items-center">
                <FiMapPin className="mr-1" />
                <span>13 Private Rooms</span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-1" />
                <span>Available: 7AM - 8PM (weekdays only)</span>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiCalendar className="mr-2" /> Date *
                </label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate ? new Date(selectedDate) : null}
                    onChange={(date) => setSelectedDate(date ? date.toISOString().split("T")[0] : "")}
                    filterDate={(date) => {
                      const day = date.getDay();
                      if (day === 0 || day === 6) return false;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      let weekdaysAdded = 0;
                      let checkDate = new Date(today);
                      while (weekdaysAdded < 2) {
                        checkDate.setDate(checkDate.getDate() + 1);
                        const checkDay = checkDate.getDay();
                        if (checkDay !== 0 && checkDay !== 6) weekdaysAdded++;
                      }
                      return date >= checkDate;
                    }}
                    minDate={new Date()}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Select a date"
                    dateFormat="MMMM d, yyyy"
                    required
                  />
                  <FiCalendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {/* Time */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiClock className="mr-2" /> Time *
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Time</option>
                  {Array.from({ length: 13 }, (_, i) => {
                    const hour = i + 7;
                    const ampm = hour >= 12 ? "PM" : "AM";
                    const displayHour = hour > 12 ? hour - 12 : hour;
                    return (
                      <option key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                        {displayHour}:00 {ampm}
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiPhone className="mr-2" /> Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Area */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiMapPin className="mr-2" /> Area *
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(e.target.value);
                    setSelectedRooms([]);
                    setIsRoomOccupied(false);
                  }}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a room</option>
                  {Object.entries(ROOMS_BY_AREA).map(([area, rooms]) => {
                    const isOccupied = isAreaOccupied(area);
                    const isReserved = isAreaReserved(area);
                    return (
                      <option 
                        key={area} 
                        value={area} 
                        disabled={isOccupied || isReserved}
                        className={isOccupied || isReserved ? "bg-red-50 text-red-600" : ""}
                      >
                        {area} {isOccupied ? "(Occupied)" : isReserved ? "(Reserved)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* Available Rooms */}
              {selectedArea && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Available Rooms</label>
                    <div className="flex flex-wrap gap-2">
                      {roomsForArea.map((room) => {
                        const isReserved = isRoomReserved(room);
                        const isOccupied = occupiedRooms.includes(room);
                        const isSelected = selectedRooms.includes(room);
                        
                        return (
                          <button
                            key={room}
                            type="button"
                            onClick={() => handleRoomClick(room)}
                            disabled={isReserved || isOccupied}
                            className={`w-20 h-10 flex items-center justify-center rounded-md transition-colors
                              ${
                                isOccupied || isReserved
                                  ? "bg-red-100 text-red-800 border border-red-300 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-200 hover:border-blue-400"
                              }`}
                          >
                            {room}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedRooms.length > 0
                        ? `Selected: ${selectedRooms.join(", ")}`
                        : "Click rooms to select"}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={selectedRooms.length === 0 || isRoomOccupied}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:bg-gray-300"
                    >
                      Reserve Room
                    </button>
                    {selectedRooms.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedRooms([])}
                        className="py-3 px-4 border rounded-md hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
        {/* Map/Search Section */}
        <div className="md:w-1/2 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-light text-gray-800 mb-3">Private Room Reference</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    checkRoomStatus(searchTerm);
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FiSearch className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-10 top-3 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Responsive Lucidchart Container */}
            <div className="w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50 mb-4">
              <div className="relative" style={{ paddingBottom: '75%' }}>
                <iframe
                  allowFullScreen
                  frameBorder="0"
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://lucid.app/documents/embedded/968a8816-e828-463f-9154-8318a2612003"
                  id="ZSulLEtxiNwy"
                  title="Room Map Diagram"
                ></iframe>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">
                {searchTerm ? "Search Results" : "Room Legend"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(searchTerm ? filteredAreas : Object.keys(ROOMS_BY_AREA)).map(area => (
                  <div
                    key={area}
                    className="flex items-center p-1 rounded hover:bg-blue-100 cursor-pointer"
                    onClick={() => {
                      checkRoomStatus(area);
                      setSelectedArea(area);
                      setSelectedRooms([]);
                    }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        isAreaOccupied(area) || isAreaReserved(area) ? "bg-red-500" : "bg-blue-500"
                      }`}
                    ></div>
                    <span className={`text-sm ${
                      isAreaOccupied(area) || isAreaReserved(area) ? "text-red-600 font-medium" : ""
                    }`}>
                      {area}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-start gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span>Occupied/Reserved</span>
                </div>
              </div>
              {searchTerm && filteredAreas.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No areas or rooms found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-medium">Confirm Reservation</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Date:</span> {selectedDate}</p>
              <p><span className="text-gray-600">Time:</span> {selectedTime}</p>
              <p><span className="text-gray-600">Area:</span> {selectedArea}</p>
              <p><span className="text-gray-600">Rooms:</span> {selectedRooms.join(", ")}</p>
              <p><span className="text-gray-600">Phone:</span> {phoneNumber}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}