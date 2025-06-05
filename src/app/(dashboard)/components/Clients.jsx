"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../../script/firebaseConfig";
import { auth } from "../../../../script/auth";
import Image from "next/image";

const SEATS_BY_AREA = {
  // SEAT MAP 1
  "Map1 A Row": ["map1-A1", "map1-A2", "map1-A3", "map1-A4", "map1-A5", "map1-A6"],
  "Map1 B Row": ["map1-B1", "map1-B2", "map1-B3", "map1-B4", "map1-B5", "map1-B6"],
  "Map1 C Row": ["map1-C1", "map1-C2", "map1-C3", "map1-C4", "map1-C5", "map1-C6"],
  "Map1 D Row": ["map1-D1", "map1-D2", "map1-D3", "map1-D4", "map1-D5", "map1-D6"],
  "Map1 E Row": ["map1-E1", "map1-E2", "map1-E3", "map1-E4", "map1-E5", "map1-E6"],
  "Map1 F Row": ["map1-F1", "map1-F2", "map1-F3", "map1-F4", "map1-F5", "map1-F6"],
  "Map1 G Row": ["map1-G1", "map1-G2", "map1-G3", "map1-G4", "map1-G5", "map1-G6"],
  "Map1 H Row": ["map1-H1", "map1-H2", "map1-H3", "map1-H4", "map1-H5", "map1-H6"],
  "Map1 I Row": ["map1-I1", "map1-I2", "map1-I3", "map1-I4"],
  "Map1 J Row": ["map1-J1", "map1-J2", "map1-J3", "map1-J4"],
  "Map1 K Row": ["map1-K1", "map1-K2", "map1-K3", "map1-K4"],
  "Map1 L Row": ["map1-L1", "map1-L2", "map1-L3", "map1-L4"],
  "Map1 M Row": ["map1-M1", "map1-M2", "map1-M3", "map1-M4"],
  "Map1 N Row": ["map1-N1", "map1-N2", "map1-N3", "map1-N4"],
  
  // SEAT MAP 2
  "Map2 A Row": ["map2-A1", "map2-A2", "map2-A3", "map2-A4", "map2-A5", "map2-A6"],
  "Map2 B Row": ["map2-B1", "map2-B2", "map2-B3", "map2-B4", "map2-B5", "map2-B6"],
  "Map2 C Row": ["map2-C1", "map2-C2", "map2-C3", "map2-C4", "map2-C5", "map2-C6"],
  "Map2 D Row": ["map2-D1", "map2-D2", "map2-D3", "map2-D4", "map2-D5", "map2-D6"],
  "Map2 E Row": ["map2-E1", "map2-E2", "map2-E3", "map2-E4", "map2-E5", "map2-E6"],
  "Map2 F Row": ["map2-F1", "map2-F2", "map2-F3", "map2-F4", "map2-F5", "map2-F6"],
  "Map2 G Row": ["map2-G1", "map2-G2", "map2-G3", "map2-G4", "map2-G5", "map2-G6"],
  "Map2 H Row": ["map2-H1", "map2-H2", "map2-H3", "map2-H4", "map2-H5", "map2-H6"],
  "Map2 I Row": ["map2-I1", "map2-I2", "map2-I3", "map2-I4"],
  "Map2 J Row": ["map2-J1", "map2-J2", "map2-J3", "map2-J4"],
  "Map2 K Row": ["map2-K1", "map2-K2", "map2-K3", "map2-K4"],
  "Map2 L Row": ["map2-L1", "map2-L2", "map2-L3", "map2-L4"],
  "Map2 M Row": ["map2-M1", "map2-M2", "map2-M3", "map2-M4"],
  "Map2 N Row": ["map2-N1", "map2-N2", "map2-N3", "map2-N4"],

  // Seat Map 3
  "Map3 A Row": ["map3-A1", "map3-A2", "map3-A3", "map3-A4", "map3-A5", "map3-A6"],
  "Map3 B Row": ["map3-B1", "map3-B2", "map3-B3", "map3-B4", "map3-B5", "map3-B6"],
  "Map3 C Row": ["map3-C1", "map3-C2", "map3-C3", "map3-C4", "map3-C5", "map3-C6"],
  "Map3 D Row": ["map3-D1", "map3-D2", "map3-D3", "map3-D4", "map3-D5", "map3-D6"],
  "Map3 E Row": ["map3-E1", "map3-E2", "map3-E3", "map3-E4", "map3-E5", "map3-E6"],
  "Map3 F Row": ["map3-F1", "map3-F2", "map3-F3", "map3-F4", "map3-F5", "map3-F6"],
  "Map3 G Row": ["map3-G1", "map3-G2", "map3-G3", "map3-G4", "map3-G5", "map3-G6"],
  "Map3 H Row": ["map3-H1", "map3-H2", "map3-H3", "map3-H4", "map3-H5", "map3-H6"],
  "Map3 I Row": ["map3-I1", "map3-I2", "map3-I3", "map3-I4"],
  "Map3 J Row": ["map3-J1", "map3-J2", "map3-J3", "map3-J4"],
  "Map3 K Row": ["map3-K1", "map3-K2", "map3-K3", "map3-K4"],
  "Map3 L Row": ["map3-L1", "map3-L2", "map3-L3", "map3-L4"],

  // Seat Map 4
  "Map4 A Row": ["map4-A1", "map4-A2", "map4-A3", "map4-A4", "map4-A5", "map4-A6"],
  "Map4 B Row": ["map4-B1", "map4-B2", "map4-B3", "map4-B4", "map4-B5", "map4-B6"],
  "Map4 C Row": ["map4-C1", "map4-C2", "map4-C3", "map4-C4", "map4-C5", "map4-C6"],
  "Map4 D Row": ["map4-D1", "map4-D2", "map4-D3", "map4-D4", "map4-D5", "map4-D6"],
  "Map4 E Row": ["map4-E1", "map4-E2", "map4-E3", "map4-E4", "map4-E5", "map4-E6"],
  "Map4 F Row": ["map4-F1", "map4-F2", "map4-F3", "map4-F4", "map4-F5", "map4-F6"],
  "Map4 G Row": ["map4-G1", "map4-G2", "map4-G3", "map4-G4", "map4-G5", "map4-G6"],

  // Seat Map 5
  "Map5 A Row": ["map5-A1", "map5-A2", "map5-A3", "map5-A4"],
  "Map5 B Row": ["map5-B1", "map5-B2", "map5-B3", "map5-B4"],
  "Map5 C Row": ["map5-C1", "map5-C2", "map5-C3", "map5-C4"],
  "Map5 D Row": ["map5-D1", "map5-D2", "map5-D3", "map5-D4"],
  "Map5 E Row": ["map5-E1", "map5-E2", "map5-E3", "map5-E4"],
  "Map5 F Row": ["map5-F1", "map5-F2", "map5-F3", "map5-F4"],
  "Map5 G Row": ["map5-G1", "map5-G2", "map5-G3", "map5-G4"],
  "Map5 H Row": ["map5-H1", "map5-H2", "map5-H3", "map5-H4"],
  "Map5 I Row": ["map5-I1", "map5-I2", "map5-I3", "map5-I4"],
  "Map5 J Row": ["map5-J1", "map5-J2", "map5-J3", "map5-J4"],
  "Map5 K Row": ["map5-K1", "map5-K2", "map5-K3", "map5-K4"],
  "Map5 L Row": ["map5-L1", "map5-L2", "map5-L3", "map5-L4"]
};


const AREA_OPTIONS = Object.keys(SEATS_BY_AREA);

function getMinBookingDate() {
  const today = new Date();
  today.setDate(today.getDate() + 2);
  return today.toISOString().split("T")[0];
}

function isWeekend(dateString) {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
}

const TIME_OPTIONS = [
  "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM"
];

const BookingHistoryModal = ({ open, onClose, bookings, onDelete }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-md relative">
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-3 text-blue-800">My Booking History</h2>
        {bookings.length === 0 && (
          <div className="text-gray-500 text-center py-10">No bookings found.</div>
        )}
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Time</th>
              <th className="px-2 py-2">Area</th>
              <th className="px-2 py-2">Seats</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="px-2 py-2">{b.date}</td>
                <td className="px-2 py-2">{b.time}</td>
                <td className="px-2 py-2">{b.area}</td>
                <td className="px-2 py-2">{Array.isArray(b.seats) ? b.seats.join(", ") : ""}</td>
                <td className="px-2 py-2">{b.status}</td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => onDelete(b.id)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

const BookingForm = () => {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedArea, setHighlightedArea] = useState(null);
  const [dateError, setDateError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [timeError, setTimeError] = useState("");

  const seatsForArea = SEATS_BY_AREA[selectedArea] || [];

  // Fetch reserved and occupied seats
  useEffect(() => {
    const fetchReservedAndOccupiedSeats = async () => {
      if (!selectedArea) {
        setReservedSeats([]);
        setOccupiedSeats([]);
        return;
      }

      const qReserved = query(
        collection(db, "visitMap"),
        where("area", "==", selectedArea),
        where("date", "==", selectedDate),
        where("time", "==", selectedTime),
        where("status", "==", "reserved")
      );
      const snapshotReserved = await getDocs(qReserved);
      let takenSeats = [];
      snapshotReserved.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.reservedSeats)) {
          takenSeats = takenSeats.concat(data.reservedSeats);
        }
      });
      setReservedSeats(takenSeats);

      const seatMapSnapshot = await getDocs(collection(db, "seatMap"));
      let occSeats = [];
      seatMapSnapshot.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.selectedSeats)) {
          occSeats = occSeats.concat(data.selectedSeats);
        }
      });
      setOccupiedSeats(occSeats);
    };
    fetchReservedAndOccupiedSeats();
  }, [selectedArea, selectedDate, selectedTime]);

  // Fetch user's booking history
  const fetchBookingHistory = async () => {
    setLoadingHistory(true);
    const user = auth.currentUser;
    if (!user) {
      setBookingHistory([]);
      setLoadingHistory(false);
      return;
    }
    const userName = user.displayName || user.email;
    const historyQuery = query(
      collection(db, "visitMap"),
      where("name", "==", userName)
    );
    const snapshot = await getDocs(historyQuery);
    const history = [];
    snapshot.forEach((doc) => {
      history.push({ ...doc.data(), id: doc.id });
    });
    setBookingHistory(history);
    setLoadingHistory(false);
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    await deleteDoc(doc(db, "visitMap", id));
    setBookingHistory((prev) => prev.filter((b) => b.id !== id));
  };

  const handleOpenHistory = async () => {
    await fetchBookingHistory();
    setShowHistory(true);
  };

  const handleSeatClick = (seat) => {
    if (reservedSeats.includes(seat) || occupiedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value);
    if (isWeekend(value)) {
      setDateError("Booking is not allowed on Saturdays or Sundays.");
    } else {
      setDateError("");
    }
  };

  // When select changes, always reset timeError
  const handleTimeChange = (e) => {
    const value = e.target.value;
    setSelectedTime(value);
    setTimeError(""); // No error since only valid options are shown
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isWeekend(selectedDate)) {
      setDateError("Booking is not allowed on Saturdays or Sundays.");
      return;
    }
    if (!selectedTime) {
      setTimeError("Please select a time between 07:00 AM and 05:00 PM.");
      return;
    }
    setShowReceipt(true);
  };

  const handleFinalSubmit = async () => {
    try {
      const user = auth.currentUser;
      const userName = user ? (user.displayName || user.email) : "Anonymous";
      await addDoc(collection(db, "visitMap"), {
        name: userName,
        date: selectedDate,
        time: selectedTime,
        area: selectedArea,
        seats: selectedSeats,
        phone: phoneNumber,
        timestamp: new Date(),
        status: "pending",
      });
      alert("Reservation submitted!");
      setShowReceipt(false);
      setSelectedSeats([]);
      setSelectedArea("");
      setSelectedDate("");
      setSelectedTime("");
      setPhoneNumber("");
      await fetchBookingHistory(); // update history after booking
    } catch (error) {
      console.error("Error submitting reservation:", error);
      alert("Failed to submit reservation.");
    }
  };

  const filteredAreas = AREA_OPTIONS.filter(area => 
    area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    SEATS_BY_AREA[area].some(seat => 
      seat.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAreaHover = (area) => {
    setHighlightedArea(area);
  };

  const handleAreaLeave = () => {
    setHighlightedArea(null);
  };

  return (
    <div className="min-h-screen bg-white-50">
      <header className="bg-white ">
        <div className="max-w-7xl mx-auto py-6 px-4 mt-15 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 ">Dedicated Seats</h1>
            <p className="text-orange-600 font-semibold text-base">Book to inquiree</p>
          </div>
          <button
            onClick={handleOpenHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            My Bookings
          </button>
        </div>
      </header>
      <main className="max-w-7xl mb-5 mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section (Left) */}
          <div className="lg:w-1/2 mt-0 bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  min={getMinBookingDate()}
                  value={selectedDate}
                  onChange={handleDateChange}
                  required
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${dateError && "border-red-500"}`}
                />
                {dateError && (
                  <div className="text-red-500 text-xs mt-1">{dateError}</div>
                )}
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
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(e.target.value);
                    setSelectedSeats([]);
                  }}
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" disabled>Select an area</option>
                  {AREA_OPTIONS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              {selectedArea && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Available Seats</label>
                    <div className="flex flex-wrap gap-2">
                      {seatsForArea.map((seat) => {
                        const isReserved = reservedSeats.includes(seat);
                        const isOccupied = occupiedSeats.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        if (isOccupied) return null;
                        return (
                          <button
                            key={seat}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={isReserved}
                            className={`w-20 h-15 flex items-center justify-center rounded-md transition-colors
                              ${isReserved ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : isSelected ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-200 hover:border-blue-400"}`}
                            title={isReserved ? "Reserved" : "Available"}
                          >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={selectedSeats.length === 0 || !!dateError || !!timeError}
                      className="flex-1 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      Reserve Seats
                    </button>
                    {selectedSeats.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSeats([])}
                        className="p-3 border rounded-md hover:bg-gray-50"
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
              <h2 className="text-xl font-light text-gray-800">Seat Map Reference</h2>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search areas or seats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border">
                <Image 
                  src="/images/label.png" 
                  alt="Seat map layout" 
                  fill 
                  className="object-contain" 
                  priority 
                />
                {highlightedArea && (
                  <div className="absolute inset-0  bg-opacity-10 pointer-events-none"></div>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">
                  {searchTerm ? "Search Results" : "Area Legend"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(searchTerm ? filteredAreas : AREA_OPTIONS.slice(0, 6)).map(area => (
                    <div 
                      key={area}
                      className="flex items-center p-1 rounded cursor-pointer"
                      onMouseEnter={() => handleAreaHover(area)}
                      onMouseLeave={handleAreaLeave}
                      onClick={() => {
                        setSelectedArea(area);
                        setSelectedSeats([]);
                      }}
                    >
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        highlightedArea === area ? "bg-blue-700" : "bg-blue-500"
                      }`}></div>
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
                {searchTerm && filteredAreas.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No areas or seats found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {showReceipt && (
       <div className="fixed inset-0 bg-black/70 bg-opacity-15 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-medium">Confirm Reservation</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Date:</span> {selectedDate}</p>
              <p><span className="text-gray-600">Time:</span> {selectedTime}</p>
              <p><span className="text-gray-600">Area:</span> {selectedArea}</p>
              <p><span className="text-gray-600">Seats:</span>{" "}
                {(selectedSeats && selectedSeats.length > 0)
                  ? selectedSeats.join(", ")
                  : "None selected"}</p>
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
      <BookingHistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        bookings={bookingHistory}
        onDelete={handleDeleteBooking}
      />
      {loadingHistory && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white py-4 px-8 rounded shadow">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;