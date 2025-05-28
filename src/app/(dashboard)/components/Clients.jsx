"use client";

import React, { useState } from "react";
import { FaCalendarDays, FaClock } from "react-icons/fa6";

const AREA_OPTIONS = [
  "areaA",
  "areaAA",
  "areaBB",
  "areaBR",
  "areaC",
  "areaCC",
  "areaD",
  "areaF",
  "areaG",
  "areaH",
  "areaI",
  "areaJ",
  "areaK",
  "areaL",
  "areaM",
  "areaN",
  "areaP",
  "areaQ",
  "areaRM",
  "areaS",
  "areaU",
  "areaV",
  "areaX",
  "areaY",
  "areaZ",
];

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

const seatsData = [
  { id: "A1", available: true },
  { id: "A2", available: false },
  { id: "A3", available: true },
  { id: "A4", available: false },
  { id: "B1", available: true },
  { id: "B2", available: true },
  { id: "B3", available: false },
  { id: "B4", available: true },
  // Add more seat availability here as needed
];

const LiveFloorPlan = ({ seatsData }) => {
  return (
    <div>
      <h3 className="font-semibold text-xl mb-4">Live Floorplan View (All Areas)</h3>
      <div className="flex gap-6 flex-wrap">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 w-full max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-400 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-400 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>

        {/* Render each area */}
        {AREA_OPTIONS.map((area) => {
          const seatsForArea = SEATS_BY_AREA[area] || [];

          return (
            <div key={area} className="border rounded p-4 w-60">
              <h4 className="font-semibold mb-2">{area}</h4>
              <div className="grid grid-cols-4 gap-2">
                {seatsForArea.map((seat) => {
                  const seatInfo = seatsData.find(
                    (s) => s.id.toLowerCase() === seat.toLowerCase()
                  );
                  const isAvailable = seatInfo ? seatInfo.available : true;
                  const bgColor = isAvailable ? "bg-green-400" : "bg-red-400";

                  return (
                    <div
                      key={seat}
                      className={`w-10 h-10 text-xs font-medium text-white flex items-center justify-center rounded ${bgColor}`}
                      title={`${seat} - ${isAvailable ? "Available" : "Occupied"}`}
                    >
                      {seat}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
    // You can send the data to your backend or database here
  };

  const seatsForArea = SEATS_BY_AREA[selectedArea] || [];

  return (
    <div className="min-h-screen flex flex-col items-left bg-white px-4 py-6 gap-10">
      <label className="font-semibold text-2xl block mt-5 mb-2">
        Dedicated Seats Area
      </label>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl px-6 py-6 flex flex-col gap-6"
      >
        {/* Book for Viewing */}
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

        {/* Area Dropdown */}
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
            <option value="" disabled>
              Select seat area
            </option>
            {AREA_OPTIONS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Seat Selection with Availability */}
        {selectedArea && (
          <div>
            <label className="font-semibold block mb-2">
              Select Seats in {selectedArea}
            </label>
            <div className="grid grid-cols-4 gap-3 max-w-xs">
              {seatsForArea.length > 0 ? (
                seatsForArea.map((seat) => {
                  const seatInfo = seatsData.find(
                    (s) => s.id.toLowerCase() === seat.toLowerCase()
                  );
                  const isAvailable = seatInfo ? seatInfo.available : true;

                  return (
                    <label
                      key={seat}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer select-none 
                        ${
                          isAvailable
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
                        disabled={!isAvailable}
                      />
                      {seat}
                    </label>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  No seats available for this area.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Reserve Button */}
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

      {/* Live Floor Plan View for all areas */}
      <div className="max-w-7xl px-6 py-6 border-t mt-10">
        <LiveFloorPlan seatsData={seatsData} />
      </div>

      {/* Reservation Summary */}
      {showReceipt && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 px-6 py-4 z-50 shadow-lg">
          <h2 className="text-xl font-bold mb-2">Reservation Summary</h2>
          <p>
            <span className="font-semibold">Date:</span> {selectedDate}
          </p>
          <p>
            <span className="font-semibold">Time:</span> {selectedTime}
          </p>
          <p>
            <span className="font-semibold">Area:</span> {selectedArea}
          </p>
          <p>
            <span className="font-semibold">Selected Seats:</span>{" "}
            {selectedSeats.join(", ")}
          </p>

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
