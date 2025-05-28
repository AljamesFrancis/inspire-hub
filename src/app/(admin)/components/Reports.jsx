import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, where, query } from "firebase/firestore";

const statusColors = {
  Confirmed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function ReservationReport() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore fetch for reservedSeats where status === true
  useEffect(() => {
    let unsub = false;
    const fetchReservations = async () => {
      setIsLoading(true);

      // Firestore query: reservation documents with status === true
      const q = query(collection(db, "visitMap"), where("status", "==", true));
      const querySnapshot = await getDocs(q);
      let docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Each doc is a reservation
      let allReservations = docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        date: doc.date
          ? (doc.date.seconds
              ? new Date(doc.date.seconds * 1000)
              : new Date(doc.date))
          : null,
        status: "Confirmed", // since status === true, treat as "Confirmed"
      }));

      // Sort by date descending (latest first)
      allReservations.sort((a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0));

      setReservations(allReservations);
      if (!unsub) setIsLoading(false);
    };
    fetchReservations();
    return () => { unsub = true; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reservation Report</h2>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Export
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Manage Reservations
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.date ? format(reservation.date, "PPPpp") : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reservation.status]}`}>
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}