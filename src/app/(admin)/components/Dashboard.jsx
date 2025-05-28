"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

const ClientDashboard = () => {
  // Mock reservation requests
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      clientName: "John Doe",
      date: "2025-06-01",
      time: "10:00 AM",
      status: "Pending",
    },
    {
      id: 2,
      clientName: "Jane Smith",
      date: "2025-06-02",
      time: "2:00 PM",
      status: "Pending",
    },
    {
      id: 3,
      clientName: "Alice Johnson",
      date: "2025-06-03",
      time: "11:30 AM",
      status: "Pending",
    },
  ]);

  // Mock data for the bar chart
  const statusData = [
    { name: "Pending", count: pendingRequests.length },
    { name: "Approved", count: 5 },
    { name: "Rejected", count: 2 },
  ];

  // Mock monthly sales data
  const monthlySalesData = [
    { month: "Jan", sales: 12500, revenue: 15000 },
    { month: "Feb", sales: 18900, revenue: 22680 },
    { month: "Mar", sales: 14200, revenue: 17040 },
    { month: "Apr", sales: 21000, revenue: 25200 },
    { month: "May", sales: 17500, revenue: 21000 },
    { month: "Jun", sales: 23000, revenue: 27600 },
    { month: "Jul", sales: 19800, revenue: 23760 },
    { month: "Aug", sales: 24500, revenue: 29400 },
    { month: "Sep", sales: 18700, revenue: 22440 },
    { month: "Oct", sales: 21500, revenue: 25800 },
    { month: "Nov", sales: 26300, revenue: 31560 },
    { month: "Dec", sales: 29500, revenue: 35400 },
  ];

  // Calculate totals for summary cards
  const totalSales = monthlySalesData.reduce((sum, month) => sum + month.sales, 0);
  const totalRevenue = monthlySalesData.reduce((sum, month) => sum + month.revenue, 0);
  const avgMonthlySales = Math.round(totalSales / monthlySalesData.length);

  return (
    <>
      <Head>
        <title>Client Dashboard | MyApp</title>
        <meta name="description" content="Dashboard with reservation overview." />
      </Head>

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-xl p-6">
              <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
              <p className="text-2xl font-bold text-blue-800 mt-2">
                {totalSales.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mt-1">All-time sales count</p>
            </div>
            <div className="bg-white shadow rounded-xl p-6">
              <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mt-1">All-time revenue</p>
            </div>
            <div className="bg-white shadow rounded-xl p-6">
              <h3 className="text-gray-500 text-sm font-medium">Avg Monthly Sales</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {avgMonthlySales.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mt-1">12-month average</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Sales Chart */}
            <div className="bg-white shadow rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-4">Monthly Sales & Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => value.toLocaleString()}
                    labelFormatter={(month) => `Month: ${month}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    name="Sales Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Reservation Status Chart */}
            <div className="bg-white shadow rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-4">Reservation Status Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Requests Section */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Pending Reservation Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    {request.clientName}
                  </h3>
                  <p className="text-gray-600 mb-1">📅 {request.date}</p>
                  <p className="text-gray-600 mb-3">⏰ {request.time}</p>
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                    {request.status}
                  </span>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                      Approve
                    </button>
                    <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p className="text-gray-500 col-span-full text-center">
                  No pending requests.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientDashboard;