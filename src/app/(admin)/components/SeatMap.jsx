"use client";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";

// Utility functions
function groupIntoPairs(entries) {
  const groups = [];
  for (let i = 0; i < entries.length; i += 2) {
    groups.push(entries.slice(i, i + 2));
  }
  return groups;
}

function groupSeatsByRow(seatMap) {
  return seatMap.reduce((acc, seat) => {
    const row = seat.number[0];
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});
}

const groupedSeats1 = groupSeatsByRow(seatMap1);
const groupedSeats2 = groupSeatsByRow(seatMap2);
const groupedSeats3 = groupSeatsByRow(seatMap3);
const groupedSeats4 = groupSeatsByRow(seatMap4);
const groupedSeats5 = groupSeatsByRow(seatMap5);

const rowEntries1 = Object.entries(groupedSeats1).sort(([a], [b]) => a.localeCompare(b));
const rowEntries2 = Object.entries(groupedSeats2).sort(([a], [b]) => a.localeCompare(b));
const rowEntries3 = Object.entries(groupedSeats3).sort(([a], [b]) => a.localeCompare(b));
const rowEntries4 = Object.entries(groupedSeats4).sort(([a], [b]) => a.localeCompare(b));
const rowEntries5 = Object.entries(groupedSeats5).sort(([a], [b]) => a.localeCompare(b));

const groupPairs1 = groupIntoPairs(rowEntries1);
const groupPairs2 = groupIntoPairs(rowEntries2);
const groupPairs3 = groupIntoPairs(rowEntries3);
const groupPairs4 = groupIntoPairs(rowEntries4);
const groupPairs5 = groupIntoPairs(rowEntries5);

export default function OccupiedSeatsMap() {
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Fetch all occupied seats from seatMap collection
  useEffect(() => {
    async function fetchOccupiedSeats() {
      const querySnapshot = await getDocs(collection(db, "seatMap"));
      const allSelectedSeats = querySnapshot.docs.flatMap(doc => 
        doc.data().selectedSeats || []
      );
      setOccupiedSeats(allSelectedSeats);
    }
    fetchOccupiedSeats();
  }, []);

  // Check if a seat is occupied
  const isSeatOccupied = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return occupiedSeats.includes(seatKey);
  };

  // Render a single seat map
  const renderSeatMap = (groupPairs, mapType, title) => (
    <div className="flex-1 min-w-[180px]">
      <h3 className="text-xs sm:text-sm font-semibold mb-3 text-center">
        {title}
      </h3>
      <div className="space-y-4 sm:space-y-6">
        {groupPairs.map((group, i) => (
          <div key={i} className="flex flex-col items-start space-y-1">
            {group.map(([rowLabel, seats]) => (
              <div key={rowLabel}>
                <p className="font-semibold mb-1 text-xs">{rowLabel} Row</p>
                <div className="flex">
                  {seats.map((seat) => {
                    const isOccupied = isSeatOccupied(seat, mapType);
                    
                    let seatColorClass = "";
                    let barColorClass = "";
                    let hoverTitle = "";
                    
                    if (isOccupied) {
                      seatColorClass = "bg-red-400 text-white";
                      barColorClass = "bg-red-600";
                      hoverTitle = "Occupied seat";
                    } else if (seat.type === "window") {
                      seatColorClass = "bg-gray-100 hover:bg-gray-200 text-gray-800";
                      barColorClass = "bg-gray-400";
                      hoverTitle = "Window seat (vacant)";
                    } else {
                      seatColorClass = "bg-gray-50 hover:bg-gray-100 text-gray-800";
                      barColorClass = "bg-gray-300";
                      hoverTitle = "Vacant seat";
                    }

                    return (
                      <div
                        key={seat.id}
                        className={`relative ${
                          seat.type === "window" ? "mr-2 sm:mr-3" : "mr-1"
                        }`}
                      >
                        <div
                          className={`h-5 w-8 sm:h-6 sm:w-10 border-0 flex flex-col items-center justify-center ${seatColorClass}`}
                          title={hoverTitle}
                        >
                          <Monitor size={8} className="mb-0.5" />
                          <span className="text-[8px] sm:text-[10px]">
                            {seat.number}
                          </span>
                        </div>
                        <div
                          className={`absolute top-0 left-0 w-full h-[2px] ${barColorClass}`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {i < groupPairs.length - 1 && (
              <div className="my-2 sm:my-3 w-full border-b border-dashed border-gray-300"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Current Seat Occupancy</h1>
      <p className="text-sm text-gray-600 mb-6">
        Showing all currently occupied seats across all maps
      </p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 border border-red-600"></div>
            <span className="text-sm">Occupied Seat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-300"></div>
            <span className="text-sm">Vacant Seat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-400"></div>
            <span className="text-sm">Window Seat</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex flex-nowrap gap-2 sm:gap-4 justify-start min-w-max">
            {renderSeatMap(groupPairs1, "map1", "Seat Map 1")}
            {renderSeatMap(groupPairs2, "map2", "Seat Map 2")}
            {renderSeatMap(groupPairs3, "map3", "Seat Map 3")}
            {renderSeatMap(groupPairs4, "map4", "Seat Map 4")}
            {renderSeatMap(groupPairs5, "map5", "Seat Map 5")}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Occupancy Summary</h2>
        <p className="text-sm">
          Total occupied seats: <span className="font-bold">{occupiedSeats.length}</span>
        </p>
      </div>
    </div>
  );
}