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
  const [currentFilter, setCurrentFilter] = useState("");
  const [mapView, setMapView] = useState(false);

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

  const handleSeatChange = (e) => {
    const value = e.target.value;
    setSelectedSeats((prev) =>
      prev.includes(value) ? prev : [...prev, value]
    );
  };

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
        status: "reserved",
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

  const renderFullMap = () => (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Full Seat Map</h2>
        <button
          onClick={() => setMapView(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Form
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search seats or areas..."
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value.toLowerCase())}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {AREA_OPTIONS.filter(area =>
          currentFilter === "" ||
          area.toLowerCase().includes(currentFilter) ||
          SEATS_BY_AREA[area].some(seat => seat.toLowerCase().includes(currentFilter))
        ).map(area => (
          <div key={area} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3">{area}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {SEATS_BY_AREA[area]
                .filter(seat =>
                  currentFilter === "" ||
                  seat.toLowerCase().includes(currentFilter) ||
                  area.toLowerCase().includes(currentFilter)
                )
                .map(seat => {
                  const isReserved = reservedSeats.includes(seat) && selectedArea === area;
                  const isSelected = selectedSeats.includes(seat) && selectedArea === area;

                  return (
                    <div
                      key={`${area}-${seat}`}
                      onClick={() => {
                        if (selectedArea === area) {
                          handleSeatClick(seat);
                        } else {
                          setSelectedArea(area);
                          setSelectedSeats([seat]);
                          setMapView(false);
                        }
                      }}
                      className={`p-2 text-center rounded cursor-pointer ${
                        isReserved
                          ? "bg-red-500 text-white cursor-not-allowed"
                          : isSelected
                          ? "bg-green-500 text-white"
                          : selectedArea === area
                          ? "bg-blue-100 hover:bg-blue-200"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {seat}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h1 className="text-3xl font-bold mt-10 mb-4">Dedicated Seats Live View</h1>

      {mapView ? (
        renderFullMap()
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="border px-3 py-2 w-full md:w-1/2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Select Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              className="border px-3 py-2 w-full md:w-1/2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Select Area</label>
            <div className="flex gap-2">
              <select
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setSelectedSeats([]);
                }}
                required
                className="border px-3 py-2 flex-1 rounded"
              >
                <option value="" disabled>Select seat area</option>
                {AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setMapView(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Available Seats
              </button>
            </div>
          </div>

          {selectedArea && (
            <>
              <div>
                <label className="block font-semibold mb-2">Select Seats</label>
                <select 
                  onChange={handleSeatChange} 
                  className="border px-3 py-2 w-full rounded"
                  value=""
                >
                  <option value="">Choose a seat</option>
                  {seatsForArea.map((seat) => (
                    <option 
                      key={seat} 
                      value={seat} 
                      disabled={reservedSeats.includes(seat)}
                    >
                      {seat} {reservedSeats.includes(seat) ? "(Reserved)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block font-semibold mb-2">Seat Preview</label>
                <div
                  className="grid gap-2 w-fit"
                  style={{ gridTemplateColumns: `repeat(${Math.min(seatsForArea.length, 6)}, 1fr)` }}
                >
                  {seatsForArea.map((seat) => {
                    const isReserved = reservedSeats.includes(seat);
                    const isSelected = selectedSeats.includes(seat);

                    return (
                      <div
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-12 h-12 flex items-center justify-center rounded font-medium cursor-pointer
                          ${isReserved ? "bg-red-500 text-white cursor-not-allowed"
                          : isSelected ? "bg-green-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"}`}
                      >
                        {seat}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click seats to select. Red = reserved.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!selectedArea || selectedSeats.length === 0}
              className="bg-orange-600 text-white px-5 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400"
            >
              Reserve
            </button>
            {selectedArea && (
              <button
                type="button"
                onClick={() => setSelectedSeats([])}
                className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
              >
                Clear Selection
              </button>
            )}
          </div>
        </form>
      )}

      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Reservation Summary</h2>
            <div className="space-y-2 mb-4">
              <p><strong>Date:</strong> {selectedDate}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Area:</strong> {selectedArea}</p>
              <p><strong>Selected Seats:</strong> {selectedSeats.join(", ")}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleFinalSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
