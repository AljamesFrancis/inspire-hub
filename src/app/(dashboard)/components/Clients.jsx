

"use client";

import React, { useState } from "react";
import { FaCalendarDays, FaClock } from "react-icons/fa6";

// Seat areas
const AREA_OPTIONS = [
  "areaA", "areaAA", "areaBB", "areaBR", "areaC", "areaCC", "areaD",
  "areaF", "areaG", "areaH", "areaI", "areaJ", "areaK", "areaL",
  "areaM", "areaN", "areaP", "areaQ", "areaRM", "areaS", "areaU",
  "areaV", "areaX", "areaY", "areaZ",
];

// Seat mapping per area
const SEATS_BY_AREA = {
  areaA: ["A1", "A2", "A3", "A4"],
  areaAA: ["AA1", "AA2", "AA3"],
  areaBB: ["B1", "B2", "B3", "B4"],
  areaBR: ["BR1", "BR2", "BR3"],
  areaC: ["C1", "C2", "C3"],
  areaCC: ["CC1", "CC2"],
  areaD: ["D1", "D2"],
  areaF: ["F1", "F2"],
  areaG: ["G1", "G2"],
  areaH: ["H1", "H2"],
  areaI: ["I1", "I2"],
  areaJ: ["J1", "J2"],
  areaK: ["K1", "K2"],
  areaL: ["L1", "L2"],
  areaM: ["M1", "M2"],
  areaN: ["N1", "N2"],
  areaP: ["P1", "P2"],
  areaQ: ["Q1", "Q2"],
  areaRM: ["RM1", "RM2"],
  areaS: ["S1", "S2"],
  areaU: ["U1", "U2"],
  areaV: ["V1", "V2"],
  areaX: ["X1", "X2"],
  areaY: ["Y1", "Y2"],
  areaZ: ["Z1", "Z2"],
};

// Live availability of seats
const seatsData = [
  { id: "A1", available: true },
  { id: "A2", available: false },
  { id: "A3", available: true },
  { id: "A4", available: false },
  { id: "B1", available: true },
  { id: "B2", available: true },
  { id: "B3", available: false },
  { id: "B4", available: true },
  // Add more if needed...
];

const BookingForm = () => {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  const handleSeatToggle = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowReceipt(true);
  };

  const handleFinalSubmit = () => {
    alert("Reservation Submitted!");
    // Add database submission here
  };

  const seatsForArea = SEATS_BY_AREA[selectedArea] || [];

  const getSeatAvailability = (seatId) => {
    const seat = seatsData.find((s) => s.id === seatId);
    return seat ? seat.available : true;
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Seat Reservation System</h1>

      {/* Live Seat View */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Live Seat Availability</h2>
        <div className="grid grid-cols-5 gap-2 border border-gray-300 rounded-lg p-4 w-full max-w-4xl mx-auto bg-gray-50">
          {[
            { area: "areaA", label: "Area A" },
            { area: "areaBB", label: "Area BB" },
            { area: "areaC", label: "Area C" },
            { area: "areaD", label: "Area D" },
            { area: "areaAA", label: "Area AA" },
            { area: "areaF", label: "Area F" },
            { area: "areaG", label: "Area G" },
            { area: "areaH", label: "Area H" },
            { area: "areaI", label: "Area I" },
            { area: "areaJ", label: "Area J" },
            { area: "areaK", label: "Area K" },
            { area: "areaL", label: "Area L" },
            { area: "areaM", label: "Area M" },
            { area: "areaN", label: "Area N" },
            { area: "areaP", label: "Area P" },
            { area: "areaQ", label: "Area Q" },
            { area: "areaRM", label: "Area RM" },
            { area: "areaS", label: "Area S" },
            { area: "areaU", label: "Area U" },
            { area: "areaV", label: "Area V" },
            { area: "areaX", label: "Area X" },
            { area: "areaY", label: "Area Y" },
            { area: "areaZ", label: "Area Z" },
            { area: "areaCC", label: "Area CC" },
            { area: "areaBR", label: "Area BR" },
          ].map(({ area, label }) => (
            <div key={area} className="border rounded-md bg-white p-2">
              <div className="text-center font-semibold text-sm mb-1">{label}</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {(SEATS_BY_AREA[area] || []).map((seatId) => {
                  const available = getSeatAvailability(seatId);
                  return (
                    <span
                      key={seatId}
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {seatId}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <label className="font-semibold text-2xl block mt-5 mb-2">
        Dedicated Seats Area
      </label>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl px-6 py-6 flex flex-col gap-6"
      >
        <div>
          <label className="font-semibold block mt-5 mb-2">Book for Viewing</label>
          <div className="flex items-center mb-2 gap-2">
            <FaCalendarDays className="text-lg" />
            <input
              type="date"
              className="border border-gray-400 rounded px-3 py-1.5 w-full"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-lg" />
            <input
              type="time"
              className="border border-gray-400 rounded px-3 py-1.5 w-full"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-2">Area of Seats</label>
          <select
            className="border border-gray-400 rounded px-3 py-1.5 w-full"
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              setSelectedSeats([]);
            }}
            required
          >
            <option value="" disabled>Select seat area</option>
            {AREA_OPTIONS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {selectedArea && (
          <div>
            <label className="font-semibold block mb-2">Select Seats in {selectedArea}</label>
            <div className="grid grid-cols-4 gap-3 max-w-xs">
              {seatsForArea.map((seat) => {
                const available = getSeatAvailability(seat);
                return (
                  <label
                    key={seat}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer select-none ${
                      available
                        ? "bg-green-100 hover:bg-green-200"
                        : "bg-red-100 cursor-not-allowed text-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={seat}
                      checked={selectedSeats.includes(seat)}
                      onChange={() => handleSeatToggle(seat)}
                      className="cursor-pointer"
                      disabled={!available}
                    />
                    {seat}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            className="bg-orange-600 text-white px-5 py-2 rounded font-semibold hover:bg-orange-700 disabled:opacity-50 w-full"
            disabled={!selectedArea || selectedSeats.length === 0}
          >
            Reserve
          </button>
        </div>
      </form>

      {showReceipt && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 px-6 py-4 z-50 shadow-lg">
          <h2 className="text-xl font-bold mb-2">Reservation Summary</h2>
          <p><strong>Date:</strong> {selectedDate}</p>
          <p><strong>Time:</strong> {selectedTime}</p>
          <p><strong>Area:</strong> {selectedArea}</p>
          <p><strong>Selected Seats:</strong> {selectedSeats.join(", ")}</p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleFinalSubmit}
              className="bg-green-600 text-white px-5 py-2 rounded font-semibold hover:bg-green-700 w-full sm:w-1/2"
            >
              Submit Reservation
            </button>
            <button
              onClick={() => setShowReceipt(false)}
              className="bg-gray-500 text-white px-5 py-2 rounded font-semibold hover:bg-gray-600 w-full sm:w-1/2"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
