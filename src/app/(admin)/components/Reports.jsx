import React, { useState, useEffect } from "react";
import { format } from 'date-fns';

const sampleReservations = [
  {
    id: "res1",
    userId: "user123",
    date: new Date("2025-06-01T10:30:00"),
    status: "Confirmed",
  },
  {
    id: "res2",
    userId: "user456",
    date: new Date("2025-06-02T15:00:00"),
    status: "Pending",
  },
  {
    id: "res3",
    userId: "user123",
    date: new Date("2025-06-03T09:00:00"),
    status: "Cancelled",
  },
];

const statusColors = {
  Confirmed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function ReservationReport() {
  const [reservations, setReservations] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      // Simulate logged-in user and role
      const loggedInUserId = "user123"; // Change this to test different users
      const loggedInUserRole = "user"; // Change to "admin" or "user"

      setUserId(loggedInUserId);
      setUserRole(loggedInUserRole);

      if (loggedInUserRole === "admin") {
        // Admin sees all
        setReservations(sampleReservations);
      } else {
        // User sees only their reservations
        const filtered = sampleReservations.filter(
          (r) => r.userId === loggedInUserId
        );
        setReservations(filtered);
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reservation Report</h2>
            <div className="flex space-x-4 mt-2 text-sm text-gray-600">
              <p><span className="font-medium">Role:</span> <span className="capitalize">{userRole}</span></p>
              <p><span className="font-medium">User ID:</span> {userId}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Export
            </button>
            {userRole === 'admin' && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Manage Reservations
              </button>
            )}
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
                    Reservation ID
                  </th>
                  {userRole === 'admin' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                  )}
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
                    <td colSpan={userRole === 'admin' ? 4 : 3} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.id}
                      </td>
                      {userRole === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.userId}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(reservation.date, "PPPpp")}
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