"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e42", "#ef4444", "#6366f1", "#fbbf24"];

const Dashboard = () => {
  const [seatData, setSeatData] = useState([]);
  const [visitData, setVisitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch seat map data
  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "seatMap"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSeatData(data);
      } catch (err) {
        setError("Failed to fetch seat data");
        console.error(err);
      }
    };

    fetchSeatData();
  }, []);

  // Fetch visit map data
  useEffect(() => {
    const fetchVisitData = async () => {
      try {
        const q = query(
          collection(db, "visitMap"),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => {
          const raw = doc.data();
          let formattedDate = '';
          if (raw.date) {
            if (typeof raw.date.toDate === "function") {
              formattedDate = raw.date.toDate().toLocaleDateString();
            } else {
              formattedDate = typeof raw.date === 'string'
                ? raw.date
                : (raw.date instanceof Date
                    ? raw.date.toLocaleDateString()
                    : '');
            }
          }
          return {
            id: doc.id,
            ...raw,
            date: formattedDate,
            time: formatTime(raw.time)
          };
        });
        setVisitData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch visit data");
        console.error(err);
        setLoading(false);
      }
    };

    fetchVisitData();
  }, []);

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // ------ DASHBOARD DATA AGGREGATION ------

  // Pie chart for seat status
  const seatStatusCounts = seatData.reduce((acc, seat) => {
    const status = seat.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const seatStatusPieData = Object.entries(seatStatusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  // Bar chart for daily visit requests (pending)
  // Group by date
  const visitByDate = {};
  visitData.forEach(visit => {
    if (visit.date) {
      visitByDate[visit.date] = (visitByDate[visit.date] || 0) + 1;
    }
  });
  const visitBarData = Object.entries(visitByDate).map(([date, value]) => ({
    date,
    "Pending Visits": value
  }));

  // Summaries
  const totalSeats = seatData.length;
  const totalPendingVisits = visitData.length;
  const totalOccupied = seatStatusCounts["occupied"] || 0;
  const totalAvailable = seatStatusCounts["available"] || 0;

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Seats</h3>
          <p className="text-2xl font-bold text-blue-800 mt-2">{totalSeats}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500 text-sm font-medium">Seats Available</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{totalAvailable}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500 text-sm font-medium">Seats Occupied</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{totalOccupied}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending Visits</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{totalPendingVisits}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Pie chart for seat status */}
        <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Seat Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={seatStatusPieData}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
              >
                {seatStatusPieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Bar chart for pending visits by date */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Visits by Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="Pending Visits" fill="#f59e42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visit Data Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pending Visits ({visitData.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visitData.map(visit => (
            <div key={visit.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-medium">{visit.clientName || 'Guest'}</h3>
              <p>Date: {visit.date || 'N/A'}</p>
              <p>Time: {visit.time || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;