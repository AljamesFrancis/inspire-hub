"use client";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, where, query, doc, updateDoc } from "firebase/firestore";
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

export default function ClientsPage() {
  const [clients, setClients] = useState([]); // All client docs from seatMap
  const [visitClients, setVisitClients] = useState([]); // All visitMap docs
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Fetch seatMap (existing) collection
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

  // Fetch visitMap collection (only status === false)
  const fetchVisitData = async () => {
    const q = query(
      collection(db, "visitMap"),
      where("status", "==", false)
    );
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVisitClients(docs);
  };
  useEffect(() => {
    fetchVisitData();
  }, []);

  // Accept handler (set status to true and refetch)
  const acceptVisit = async (visitId) => {
    if (!visitId) return;
    try {
      const visitRef = doc(db, "visitMap", visitId);
      await updateDoc(visitRef, { status: true });
      await fetchVisitData(); // refetch after update
      setSelectedClientId(null); // Optionally deselect after accept
      alert("Status updated to accepted!");
    } catch (error) {
      console.error("Failed to accept visit:", error);
      alert("Failed to accept visit.");
    }
  };

  // Only the selected client from visitMap
  const selectedVisitClient = visitClients.find(c => c.id === selectedClientId);
  // All reservedSeats for the selected visit client
  const allReservedSeats = selectedVisitClient?.reservedSeats || [];
  // All selectedSeats from seatMap (for red highlight)
  const allSelectedSeats = clients.flatMap((c) => c.selectedSeats || []);
  // Find the selected visit client from visitMap collection (details)
  const selectedClient = selectedVisitClient || null;

  // Helper to check if a seat is reserved (visitMap)
  const isReservedSeat = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return allReservedSeats.includes(seatKey);
  };

  // Helper to check if a seat is selected (seatMap)
  const isSelectedSeat = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return allSelectedSeats.includes(seatKey);
  };

  // Rendering seat map with updated logic (selectedSeats = red, reservedSeats = blue)
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
                    const reserved = isReservedSeat(seat, mapType);
                    const selected = isSelectedSeat(seat, mapType);

                    // Priority: reservedSeats (blue) > selectedSeats (red) > window/normal
                    let seatColorClass = "";
                    let barColorClass = "";
                    let hoverTitle = "";
                    if (reserved) {
                      seatColorClass = "bg-blue-500 text-white";
                      barColorClass = "bg-blue-600";
                      hoverTitle = "This seat is scheduled for a visit";
                    } else if (selected) {
                      seatColorClass = "bg-red-400 text-white";
                      barColorClass = "bg-red-600";
                      hoverTitle = "This seat is currently occupied";
                    } else if (seat.type === "window") {
                      seatColorClass = "bg-gray-100 hover:bg-gray-200 text-gray-800";
                      barColorClass = "bg-gray-400";
                      hoverTitle = "Window seat (vacant)";
                    } else {
                      seatColorClass = "bg-gray-50 hover:bg-gray-100 text-gray-800";
                      barColorClass = "bg-gray-300";
                      hoverTitle = "Vacant seat";
                    }

                    // Disable if reserved or selected
                    const disabled = reserved || selected;

                    return (
                      <div
                        key={seat.id}
                        className={`relative ${
                          seat.type === "window"
                            ? "mr-2 sm:mr-3"
                            : "mr-1"
                        }`}
                      >
                        <button
                          disabled={disabled}
                          className={`h-5 w-8 sm:h-6 sm:w-10 border-0 flex flex-col items-center justify-center transition ${seatColorClass} ${disabled ? "cursor-not-allowed" : ""}`}
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

  const rowEntries1 = Object.entries(groupedSeats1).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const rowEntries2 = Object.entries(groupedSeats2).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const rowEntries3 = Object.entries(groupedSeats3).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const rowEntries4 = Object.entries(groupedSeats4).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const rowEntries5 = Object.entries(groupedSeats5).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const groupPairs1 = groupIntoPairs(rowEntries1);
  const groupPairs2 = groupIntoPairs(rowEntries2);
  const groupPairs3 = groupIntoPairs(rowEntries3);
  const groupPairs4 = groupIntoPairs(rowEntries4);
  const groupPairs5 = groupIntoPairs(rowEntries5);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-l font-semibold">Clients Request For Visit</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {visitClients.map((client) => (
            <div
              key={client.id}
              className={`p-4 cursor-pointer hover:bg-blue-50 ${
                selectedClientId === client.id ? "bg-blue-100" : ""
              }`}
              onClick={() => setSelectedClientId(client.id)}
            >
              <h3 className="font-medium">{client.name}</h3>
              <p className="text-sm text-gray-600">{client.company}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-x-hidden">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {selectedClient ? (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {selectedClient.name}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {selectedClient.company}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-green-400 text-white rounded hover:bg-green-500 text-sm sm:text-base"
                    onClick={() => acceptVisit(selectedClient.id)}
                  >
                    Accept
                  </button>
                  <button className="px-3 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base">
                    Reject
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                    Contact Information
                  </h2>
                  <p className="text-sm sm:text-base">
                    <strong>Email:</strong> {selectedClient.email}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Phone:</strong> {selectedClient.phone}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Seat Preference:</strong> {selectedClient.seatPreference}
                  </p>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                    Client Details
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    {selectedClient.details}
                  </p>
                  <div className="mt-4">
                    <h3 className="font-semibold text-sm mb-1">
                      Visit Reservation Details
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      <strong>Reserved Seats:</strong>
                      {" "}
                      {selectedClient.reservedSeats && selectedClient.reservedSeats.length
                        ? selectedClient.reservedSeats.join(", ")
                        : "None"}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Visit Date:</strong>{" "}
                      {selectedClient.date
                        ? (selectedClient.date.seconds
                            ? new Date(selectedClient.date.seconds * 1000).toLocaleString()
                            : selectedClient.date.toLocaleString())
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                  Dedicated Desk
                </h2>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto">
                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 border border-blue-700"
                        title="This seat is scheduled for a visit"
                      ></div>
                      <span className="text-xs sm:text-sm">Schedule for visit</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 bg-red-400 border border-red-700"
                        title="This seat is currently occupied"
                      ></div>
                      <span className="text-xs sm:text-sm">Occupied Seat</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-50 border border-gray-300"
                        title="Vacant seat"
                      ></div>
                      <span className="text-xs sm:text-sm">Vacant Seats</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto pb-2">
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
          ) : (
            <div className="p-6 text-center text-gray-500">
              Select a client to view details and seat assignment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}