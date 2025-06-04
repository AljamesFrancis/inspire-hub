"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { FaChair, FaRegCalendarAlt } from "react-icons/fa";
import { MdOutlineEventNote, MdMeetingRoom } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";

const COLORS = ["#10b981", "#ef4444", "#6366f1"];

const totalSeats = seatMap1.length + seatMap2.length + seatMap3.length + seatMap4.length + seatMap5.length;

const Dashboard = () => {
  const [seatData, setSeatData] = useState([]);
  const [visitData, setVisitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState(totalSeats);
  const [privateOfficeList, setPrivateOfficeList] = useState([]);
  const [occupiedPrivateOffices, setOccupiedPrivateOffices] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch seat data
        const seatQuerySnapshot = await getDocs(collection(db, "seatMap"));
        const seatData = seatQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSeatData(seatData);
        
        // Calculate occupied seats
        const allSelectedSeats = seatQuerySnapshot.docs.flatMap(doc =>
          doc.data().selectedSeats || []
        );
        setOccupiedSeats(allSelectedSeats);
        setAvailableSeats(totalSeats - allSelectedSeats.length);
        
        // Fetch private offices
        const officeQuerySnapshot = await getDocs(collection(db, "privateOffice"));
        const officeDocs = officeQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPrivateOfficeList(officeDocs);
        
        // Calculate occupied offices
        const allSelectedPO = [];
        officeDocs.forEach(office => {
          if (office.selectedPO) {
            if (Array.isArray(office.selectedPO)) {
              allSelectedPO.push(...office.selectedPO);
            } else {
              allSelectedPO.push(office.selectedPO);
            }
          }
        });
        setOccupiedPrivateOffices(allSelectedPO);
        
        // Fetch pending visits
        const visitQuery = query(
          collection(db, "visitMap"),
          where("status", "==", "pending")
        );
        const visitQuerySnapshot = await getDocs(visitQuery);
        const visitData = visitQuerySnapshot.docs.map(doc => {
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
        setVisitData(visitData);
        
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error(err);
        setLoading(false);
      }
    };

    fetchAllData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch detailed visit information
  const fetchVisitDetails = async (visitId) => {
    try {
      const visitDoc = await getDoc(doc(db, "visitMap", visitId));
      if (visitDoc.exists()) {
        const visitData = visitDoc.data();
        let formattedDate = '';
        if (visitData.date) {
          if (typeof visitData.date.toDate === "function") {
            formattedDate = visitData.date.toDate().toLocaleDateString();
          } else {
            formattedDate = typeof visitData.date === 'string'
              ? visitData.date
              : (visitData.date instanceof Date
                  ? visitData.date.toLocaleDateString()
                  : '');
          }
        }
        
        setSelectedVisit({
          id: visitDoc.id,
          ...visitData,
          date: formattedDate,
          time: formatTime(visitData.time)
        });
        setShowVisitModal(true);
      }
    } catch (error) {
      console.error("Error fetching visit details:", error);
      setError("Failed to fetch visit details");
    }
  };

  // Prepare chart data
  const seatOccupancyData = [
    { name: 'Available', value: availableSeats },
    { name: 'Occupied', value: occupiedSeats.length },
  ];

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

  const totalPendingVisits = visitData.length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-red-800">Error Loading Dashboard</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workspace Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of workspace utilization and visitor management</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Live Data</span>
          <span className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Seats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Seats</p>
              <h3 className="mt-2 text-3xl font-semibold text-gray-900">{totalSeats}</h3>
              <p className="mt-1 text-sm text-gray-500">Across all workspaces</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <FaChair className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Available Seats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Available</p>
              <h3 className="mt-2 text-3xl font-semibold text-green-600">{availableSeats}</h3>
              <p className="mt-1 text-sm text-gray-500">{Math.round((availableSeats / totalSeats) * 100)}% of capacity</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <HiOutlineUserAdd className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Occupied Seats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Occupied</p>
              <h3 className="mt-2 text-3xl font-semibold text-red-600">{occupiedSeats.length}</h3>
              <p className="mt-1 text-sm text-gray-500">{Math.round((occupiedSeats.length / totalSeats) * 100)}% utilization</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <HiOutlineUserRemove className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Private Offices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Private Offices</p>
              <h3 className="mt-2 text-3xl font-semibold text-purple-600">{occupiedPrivateOffices.length}</h3>
              <p className="mt-1 text-sm text-gray-500">{privateOfficeList.length} total offices</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <HiOutlineOfficeBuilding className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Seat Occupancy Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Seat Occupancy</h2>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-gray-500">Available</span>
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-2"></span>
              <span className="text-xs text-gray-500">Occupied</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seatOccupancyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  <Cell fill="#10b981" stroke="#fff" strokeWidth={2} />
                  <Cell fill="#ef4444" stroke="#fff" strokeWidth={2} />
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name) => [`${value} seats`, name]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '0.5rem'
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Requests Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Visit Requests Trend</h2>
            <div className="flex items-center space-x-1 text-blue-600">
              <BsGraphUp className="w-5 h-5" />
              <span className="text-sm font-medium">Last 30 days</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '0.5rem'
                  }}
                  labelStyle={{ fontWeight: 500, color: '#111827' }}
                  formatter={(value) => [`${value} visits`, 'Pending Visits']}
                />
                <Bar 
                  dataKey="Pending Visits" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Visits Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Visit Requests</h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                {totalPendingVisits} pending
              </span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {visitData.length > 0 ? (
            visitData.map((visit) => (
              <div 
                key={visit.id} 
                className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => fetchVisitDetails(visit.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <HiOutlineUserGroup className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{visit.name || 'Guest'}</h3>
                      <p className="text-sm text-gray-500">{visit.company || 'No company specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 flex items-center">
                      <FaRegCalendarAlt className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      {visit.date || 'N/A'}
                    </div>
                    {visit.time && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <HiOutlineClock className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        {visit.time}
                      </div>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <MdOutlineEventNote className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending visits</h3>
              <p className="mt-1 text-sm text-gray-500">All visit requests have been processed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Visit Details Modal */}
      {showVisitModal && selectedVisit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Visit Request Details</h3>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-y-4 gap-x-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Visitor Information</h4>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedVisit.name || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedVisit.email || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedVisit.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedVisit.company || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Visit Date</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedVisit.date || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Visit Time</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedVisit.time || 'Not specified'}</p>
                </div>
                
                {selectedVisit.host && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Host</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedVisit.host}</p>
                  </div>
                )}
                
                {selectedVisit.purpose && (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Purpose of Visit</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedVisit.purpose}</p>
                  </div>
                )}
                
                {selectedVisit.additionalInfo && (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Additional Information</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedVisit.additionalInfo}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowVisitModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Data refreshes automatically every 60 seconds. Last updated: {lastUpdated.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Dashboard;