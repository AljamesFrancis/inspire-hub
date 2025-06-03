"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";
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
import {
  HiOutlineUserGroup,
  HiOutlineUserAdd,
  HiOutlineUserRemove,
  HiOutlineClock,
} from "react-icons/hi";
import { FaChair } from "react-icons/fa";
import { MdOutlineEventNote } from "react-icons/md";

const COLORS = ["#10b981", "#ef4444", "#6366f1"]; // Green for available, Red for occupied, Purple for others
const CARD_ICONS = [
  <FaChair className="h-7 w-7 text-blue-500" />,
  <HiOutlineUserAdd className="h-7 w-7 text-green-500" />,
  <HiOutlineUserRemove className="h-7 w-7 text-red-500" />,
  <MdOutlineEventNote className="h-7 w-7 text-yellow-500" />,
];

// Calculate total seats from all seat maps
const totalSeats = seatMap1.length + seatMap2.length + seatMap3.length + seatMap4.length + seatMap5.length;

const Dashboard = () => {
  const [seatData, setSeatData] = useState([]);
  const [visitData, setVisitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState(totalSeats);

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

  // Fetch occupied seats
  useEffect(() => {
    async function fetchOccupiedSeats() {
      const querySnapshot = await getDocs(collection(db, "seatMap"));
      const allSelectedSeats = querySnapshot.docs.flatMap(doc =>
        doc.data().selectedSeats || []
      );
      setOccupiedSeats(allSelectedSeats);
      // Calculate available seats
      setAvailableSeats(totalSeats - allSelectedSeats.length);
    }
    fetchOccupiedSeats();
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

  // Prepare data for seat occupancy pie chart
  const seatOccupancyData = [
    { name: 'Available', value: availableSeats },
    { name: 'Occupied', value: occupiedSeats.length },
  ];

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
  const totalPendingVisits = visitData.length;

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-extrabold mb-8 text-blue-900 tracking-tight">Dashboard</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mb-10">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-lg border border-blue-100 p-6 flex flex-col gap-2 transition hover:shadow-xl hover:-translate-y-1 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Seats</h3>
              <p className="text-3xl font-black text-blue-700 mt-2">{totalSeats}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2 shadow-sm">
              <FaChair className="h-7 w-7 text-blue-500" />
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-white to-green-100 shadow-lg border border-green-100 p-6 flex flex-col gap-2 transition hover:shadow-xl hover:-translate-y-1 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Seats Available</h3>
              <p className="text-3xl font-black text-green-600 mt-2">{availableSeats}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2 shadow-sm">
              <HiOutlineUserAdd className="h-7 w-7 text-green-500" />
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-white to-red-100 shadow-lg border border-red-100 p-6 flex flex-col gap-2 transition hover:shadow-xl hover:-translate-y-1 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Seats Occupied</h3>
              <p className="text-3xl font-black text-red-600 mt-2">{occupiedSeats.length}</p>
            </div>
            <div className="bg-red-100 rounded-full p-2 shadow-sm">
              <HiOutlineUserRemove className="h-7 w-7 text-red-500" />
            </div>
          </div>
        </div>
        {/* Card 4 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 via-white to-yellow-100 shadow-lg border border-yellow-100 p-6 flex flex-col gap-2 transition hover:shadow-xl hover:-translate-y-1 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Pending Visits</h3>
              <p className="text-3xl font-black text-yellow-600 mt-2">{totalPendingVisits}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-2 shadow-sm">
              <MdOutlineEventNote className="h-7 w-7 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Pie chart for seat occupancy */}
        <div className="bg-white shadow-lg border border-blue-100 rounded-2xl p-6 flex flex-col items-center hover:shadow-xl transition">
          <h2 className="text-lg font-bold mb-4 text-blue-700 tracking-wide">Seat Occupancy</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={seatOccupancyData}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={110}
                innerRadius={60}
                stroke="#e0e7ff"
                strokeWidth={2}
                fill="#8884d8"
              >
                {seatOccupancyData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
              />
              <RechartsTooltip 
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #dbeafe",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(59,130,246,.13)",
                  fontWeight: 500,
                  color: "#374151"
                }}
                formatter={(value, name, props) => [
                  `${value} seats`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Bar chart for pending visits by date */}
        <div className="bg-white shadow-lg border border-yellow-100 rounded-2xl p-6 hover:shadow-xl transition">
          <h2 className="text-lg font-bold mb-4 text-yellow-700 tracking-wide">Pending Visits by Day</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={visitBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" opacity={0.35}/>
              <XAxis dataKey="date" tick={{ fontWeight: 500, fill:"#a16207" }} />
              <YAxis tick={{ fontWeight: 500, fill:"#a16207" }} />
              <RechartsTooltip
                contentStyle={{
                  background: "#fffbe8",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(253,230,138,.13)",
                  fontWeight: 500,
                  color: "#a16207"
                }}
              />
              <Bar dataKey="Pending Visits" fill="#f59e42" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visit Data Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-blue-900 tracking-tight">Pending Visits ({visitData.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {visitData.map(visit => (
            <div
              key={visit.id}
              className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-100 shadow-lg hover:shadow-xl transition rounded-2xl p-5 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineUserGroup className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">{visit.name || 'Guest'}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdOutlineEventNote className="h-4 w-4 text-blue-400" />
                <span>Date: {visit.date || 'N/A'}</span>
              </div>
              {visit.time && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiOutlineClock className="h-4 w-4 text-blue-400" />
                  <span>Time: {visit.time}</span>
                </div>
              )}
              {visit.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span className="font-medium">Company:</span>
                  <span>{visit.company}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;