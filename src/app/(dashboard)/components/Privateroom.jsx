"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import {collection,addDoc,getDocs,query,where,} from "firebase/firestore";
import { db } from "../../../../script/firebaseConfig";
import { auth } from "../../../../script/auth";

const ROW_OPTIONS = ["Map-1", "Map-2", "Map-3", "Map-4", "Map-5", "Map-6", "Map-7", "Map-8", "Map-9", "Map-10", "Map-11", "Map-12", "13"];

const AREA_OPTIONS = [
  "A_Row", "B_Row", "C_Row", "D_Row", "E_Row", "F_Row", "G_Row", "H_Row",
  "I_Row", "J_Row", "K_Row", "L_Row", "M_Row", "N_Row", "O_Row",
  "P_Row", "Q_Row", "R_Row", "S_Row", "T_Row", "U_Row", "V_Row",
  "W_Row", "X_Row", "Y_Row", "Z_Row"
];

const ROOMS_BY_AREA = {
  // PRIVATE ROOM MAP 1
  "BICOL": ["Vacant"],
  
  //  PRIVATE ROOM MAP 2
  "CEBU": ["Vacant"],
  
  // PRIVATE ROOM MAP 3
  "PAMPANGA": ["Vacant"],
  
  // PRIVATE ROOM MAP 4
  "NUEVA ECIJA": ["Vacant"],

  // PRIVATE ROOM MAP 5
  "PANGASINAN": ["Vacant"],

  // PRIVATE ROOM MAP 6
  "LAGUNA": ["Occupied"],

  // PRIVATE ROOM MAP 7
  "RIZAL": ["Occupied"],

  // PRIVATE ROOM MAP 8
  "BACOLOD": ["Occupied"],

  // PRIVATE ROOM MAP 9
  "ILOILO": ["Occupied"],

  // PRIVATE ROOM MAP 10
  "BATANGAS": ["Vacant"],

  // PRIVATE ROOM MAP 11
  "MINDORO": ["Vacant"],

  // PRIVATE ROOM MAP 12
  "CAGAYAN DE ORO": ["Vacant"],

  // PRIVATE ROOM MAP 13
  "QUEZON": ["Vacant"],

};

const BookingForm = () => {
  const [selectedMap, setSelectedRow] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [reservedRooms, setReservedRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedArea, setHighlightedArea] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isRoomOccupied, setIsRoomOccupied] = useState(false);

  const roomsForArea = ROOMS_BY_AREA[selectedArea] || [];

  useEffect(() => {
    const fetchReservedRooms = async () => {
      if (!selectedArea || !selectedDate || !selectedTime) return;

      const q = query(
        collection(db, "visitMap"),
        where("area", "==", selectedArea),
        where("date", "==", selectedDate),
        where("time", "==", selectedTime),
        where("status", "==", "reserved")
      );

      const snapshot = await getDocs(q);
      const takenRooms = snapshot.docs.flatMap(doc => doc.data().rooms || []);
      setReservedRooms(takenRooms);
    };

    fetchReservedRooms();
  }, [selectedArea, selectedDate, selectedTime]);

  const handleRoomClick = (room) => {
    if (reservedRooms.includes(room)) return;
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
    alert(`Room "${roomName}" was not found.`);
    setIsRoomOccupied(false); // fallback
    return;
  }

  const [areaName, rooms] = foundArea;
  const isOccupied = rooms.some(room => room.toLowerCase() === "occupied");
  setIsRoomOccupied(isOccupied); // ✅ update state

  if (isOccupied) {
    alert(`${areaName} is currently OCCUPIED.`);
  } else {
    alert(`${areaName} is AVAILABLE for viewing.`);
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    setShowReceipt(true);
  };

  const handleFinalSubmit = async () => {
    try {
      const user = auth.currentUser;
      const userName = user ? (user.displayName || user.email) : "Anonymous";
      const userEmail = user ? user.email : "No Email";

      await addDoc(collection(db, "privateOfficeVisits"), {
        name: userName,
        email: userEmail,
        phone: phoneNumber,
        date: selectedDate,
        time: selectedTime,
        area: selectedArea,
        reservedRooms: selectedRooms,
        timestamp: new Date(),
        status: "pending",
      });

      alert("Reservation submitted!");
      setShowReceipt(false);
      setSelectedRooms([]);
      setSelectedArea("");
      setSelectedDate("");
      setSelectedTime("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error submitting reservation:", error);
      alert("Failed to submit reservation.");
    }
  };

  const filteredAreas = Object.keys(ROOMS_BY_AREA).filter(area =>
    area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ROOMS_BY_AREA[area].some(room =>
      room.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAreaHover = (area) => setHighlightedArea(area);
  const handleAreaLeave = () => setHighlightedArea(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-7xl mx-auto py-6 px-4 mt-20">
        <h1 className="text-3xl font-bold text-gray-900">Private Room Reservation</h1>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Form Section */}
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Book Private Room</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                     <div className="relative"> {/* New wrapper div */}
                    <DatePicker
                                selected={selectedDate ? new Date(selectedDate) : null}
                                onChange={(date) => setSelectedDate(date.toISOString().split("T")[0])}
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
                                minDate={new Date()}
                                className="w-full p-3 border border-black rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-black"
                                placeholderText="mm/dd/yyyy"
                                dateFormat="yyyy-MM-dd"
                                wrapperClassName="w-full"
                                />
                                   <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-black pointer-events-none" /> {/* New icon */}
  </div>
</div>

<div className="space-y-1">
  <label className="text-sm font-medium text-gray-700">Time</label>
  <select
    value={selectedTime}
    onChange={(e) => setSelectedTime(e.target.value)}
    required
    className="w-full p-3 border rounded-md"
  >
    <option value="" disabled>Select time</option>
    {Array.from({ length: 13 }, (_, i) => {
      const hour = i + 8; // Starts at 7 AM (7) to 7 PM (19)
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 12 ? 12 : hour > 12 ? hour - 12 : hour;
      
      return (
        <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
          {displayHour}:00 {period} {/* Changed to .00 format */}
        </option>
      );
    })}
  </select>
</div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="w-full p-3 border rounded-md placeholder-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Area</label>
                <select 
                  value={selectedArea} 
                  onChange={(e) => { 
                    setSelectedArea(e.target.value); 
                    setSelectedRooms([]); 
                  }} 
                  required 
                  className="w-full p-3 border rounded-md"
                >
                  <option value="" disabled>Select a room</option>
                    {Object.entries(ROOMS_BY_AREA).map(([area, rooms]) => {
                      const isOccupied = rooms.includes("Occupied");
                        return (
                  <option
                    key={area}
                    value={area}
                    disabled={isOccupied}
                    className={isOccupied ? "text-red-500" : ""}
                >
                    {area} {isOccupied ? "(Occupied)" : ""}
                    </option>
                     );
                    })}

                </select>
              </div>

              {selectedArea && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Available Rooms</label>
                    <div className="flex flex-wrap gap-2">
                      {roomsForArea.map((room) => {
                        const isReserved = reservedRooms.includes(room);
                        const isSelected = selectedRooms.includes(room);

                        return (
                          <button
                            key={room}
                            type="button"
                            onClick={() => handleRoomClick(room)}
                            disabled={isReserved || isRoomOccupied} // ✅ Disable if reserved or occupied
                              className={`w-20 h-15 flex items-center justify-center rounded-md transition-colors
                                ${
                                  isReserved || isRoomOccupied
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
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
                      disabled={selectedRooms.length === 0 || isRoomOccupied} // ✅ Disable if no rooms or room is occupied
                      className="flex-1 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      Reserve Room
                    </button>
                    {selectedRooms.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedRooms([])} 
                        className="p-3 border rounded-md hover:bg-gray-50 disabled:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Map Section */}
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-light text-gray-800">Private Room Reference</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search rooms..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      checkRoomStatus();
                    }
                  }}
                  className="w-full p-3 border rounded-md" 
                />

                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")} 
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Responsive Lucidchart Container */}
              <div className="w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50">
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
                  {(searchTerm ? filteredAreas : Object.keys(ROOMS_BY_AREA).slice(0, 13)).map(area => (
                    <div
                      key={area}
                        className="flex items-center p-1 rounded hover:bg-blue-100 cursor-pointer"
                        onMouseEnter={() => handleAreaHover(area)}
                        onMouseLeave={handleAreaLeave}
                        onClick={() => {
                          checkRoomStatus(area); // 🔥 Check room status on click
                          setSelectedArea(area);
                          setSelectedRooms([]);
                        }}
                      >
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            ROOMS_BY_AREA[area].includes("Occupied") ? "bg-red-500" : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
                {searchTerm && filteredAreas.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No areas or rooms found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                className="flex-1 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
              <button 
                onClick={() => setShowReceipt(false)} 
                className="flex-1 p-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;