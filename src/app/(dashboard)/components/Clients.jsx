"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../script/firebaseConfig";
import { auth } from "../../../../script/auth";
import Image from "next/image";

const AREA_OPTIONS = [
  "areaA", "areaAA", "areaB", "areaBB", "areaBR", "areaC", "areaCC", "areaD",
  "areaF", "areaG", "areaH", "areaI", "areaJ", "areaK", "areaL",
  "areaM", "areaN", "areaP", "areaQ", "areaRM", "areaS", "areaU",
  "areaV", "areaX", "areaY", "areaZ",
];

const SEATS_BY_AREA = {
  areaA: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"],
  areaAA: ["aa1", "aa2", "aa3", "aa4", "aa5", "aa6", "aa7", "aa8", "aa9"],
  areaB: ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"],
  areaBB: ["bb1", "bb2", "bb3", "bb4", "bb5", "bb6", "bb7", "bb8", "bb9", "bb10", "bb11", "bb12"],
  areaBR: ["br1", "br2", "br3"],
  areaC: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
  areaCC: ["cc1", "cc2", "cc3", "cc4", "cc5", "cc6", "cc7", "cc8", "cc9", "cc10", "cc11", "cc12"],
  areaD: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8"],
  areaF: ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"],
  areaG: ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9"],
  areaH: ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "h11", "h12"],
  areaI: ["i1", "i2", "i3", "i4", "i5", "i6"],
  areaJ: ["j1", "j2", "j3", "j4", "j5", "j6", "j7", "j8"],
  areaK: ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9", "k10"],
  areaL: ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"],
  areaM: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10"],
  areaN: ["n1", "n2", "n3", "n4", "n5", "n6"],
  areaP: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
  areaQ: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"],
  areaRM: ["rm1", "rm2", "rm3", "rm4", "rm5", "rm6", "rm7", "rm8", "rm9", "rm10", "rm11", "rm12", "rm13", "rm14"],
  areaS: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12"],
  areaU: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12"],
  areaV: ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10", "v11", "v12"],
  areaX: ["x1", "x2", "x3", "x6", "x7", "x8"],
  areaY: ["y1", "y2", "y3", "y4", "y5", "y6", "y7", "y8"],
  areaZ: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8", "z9", "z10", "z11", "z12"],
};

const BookingForm = () => {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedArea, setHighlightedArea] = useState(null);

  const seatsForArea = SEATS_BY_AREA[selectedArea] || [];

  useEffect(() => {
    const fetchReservedSeats = async () => {
      if (!selectedArea || !selectedDate || !selectedTime) return;

      const q = query(
        collection(db, "visitMap"),
        where("area", "==", selectedArea),
        where("date", "==", selectedDate),
        where("time", "==", selectedTime),
        where("status", "==", "reserved")
      );

      const snapshot = await getDocs(q);
      const takenSeats = snapshot.docs.flatMap(doc => doc.data().seats || []);
      setReservedSeats(takenSeats);
    };

    fetchReservedSeats();
  }, [selectedArea, selectedDate, selectedTime]);

  const handleSeatClick = (seat) => {
    if (reservedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
        timestamp: new Date(),
        status: "pending",
      });

      alert("Reservation submitted!");
      setShowReceipt(false);
      setSelectedSeats([]);
      setSelectedArea("");
      setSelectedDate("");
      setSelectedTime("");
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
        <div className="max-w-7xl mx-auto py-6 px-4 mt-15">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Seat Reservation</h1>

        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section (Left) */}
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
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
                        const isSelected = selectedSeats.includes(seat);

                        return (
                          <button
                            key={seat}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={isReserved}
                            className={`w-12 h-12 flex items-center justify-center rounded-md transition-colors
                              ${isReserved ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : isSelected ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-200 hover:border-blue-400"}`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedSeats.length > 0 
                        ? `Selected: ${selectedSeats.join(", ")}`
                        : "Click seats to select"}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={selectedSeats.length === 0}
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

          {/* Map Section (Right) */}
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

              {/* Map Image with Highlight */}
              <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border">
                <Image
                  src="/images/map.png"
                  alt="Seat map layout"
                  fill
                  className="object-contain"
                  priority
                />
                {highlightedArea && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none"></div>
                )}
              </div>

              {/* Search Results / Area Legend */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">
                  {searchTerm ? "Search Results" : "Area Legend"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(searchTerm ? filteredAreas : AREA_OPTIONS.slice(0, 6)).map(area => (
                    <div 
                      key={area}
                      className="flex items-center p-1 rounded hover:bg-blue-100 cursor-pointer"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-medium">Confirm Reservation</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Date:</span> {selectedDate}</p>
              <p><span className="text-gray-600">Time:</span> {selectedTime}</p>
              <p><span className="text-gray-600">Area:</span> {selectedArea}</p>
              <p><span className="text-gray-600">Seats:</span> {selectedSeats.join(", ")}</p>
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