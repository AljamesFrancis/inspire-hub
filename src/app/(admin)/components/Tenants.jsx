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

export default function SeatMapTable() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch seatMap collection
  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "seatMap"));
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(docs);
    }
    fetchData();
  }, []);

  // Rendering seat map modal
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
                    const seatKey = `${mapType}-${seat.number}`;
                    const isSelected = selectedClient?.selectedSeats?.includes(seatKey);

                    let seatColorClass = "";
                    let barColorClass = "";
                    let hoverTitle = "";
                    
                    if (isSelected) {
                      seatColorClass = "bg-green-400 text-white";
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
                        <button
                          className={`h-5 w-8 sm:h-6 sm:w-10 border-0 flex flex-col items-center justify-center transition ${seatColorClass}`}
                          title={hoverTitle}
                        >
                          <Monitor size={8} className="mb-0.5" />
                          <span className="text-[8px] sm:text-[10px]">
                            {seat.number}
                          </span>
                        </button>
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
      <h1 className="text-2xl font-bold mb-6">Seat Map Occupancy</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selected Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.selectedSeats?.join(", ") || "None"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seat Map Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedClient?.name}'s Seat Map
                  </h2>
                  <p className="text-gray-600">
                    {selectedClient?.company}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold">Selected Seats:</h3>
                <p className="text-gray-700">
                  {selectedClient?.selectedSeats?.join(", ") || "None"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}