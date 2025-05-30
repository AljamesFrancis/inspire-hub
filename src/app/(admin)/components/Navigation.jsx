'use client';
import Image from 'next/image';
import Link from 'next/link';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';

export default function Navigation() {
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 px-6 py-4 flex items-center justify-between bg-blue-900 shadow-md">
        {/* Left: Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/images/inspirelogo.png"
              alt="Website Logo"
              width={40}
              height={40}
            />
            <span className="text-white font-bold text-lg">Inspire Hub</span>
          </div>
        </div>

        {/* Right: Navigation links */}
        <div className="flex space-x-6 items-center">
          {/* Dashboard Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              href="/dashboard"
              className="text-white font-bold hover:text-blue-300 transition flex items-center space-x-2"
            >
              <DashboardIcon fontSize="small" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/schedvisit"
              className="text-white font-bold hover:text-blue-300 transition flex items-center space-x-2"
            >
              <GroupIcon fontSize="small" />
              <span>Schedule Visit</span>
            </Link>
            <Link
              href="/tenants"
              className="text-white font-bold hover:text-blue-300 transition flex items-center space-x-2"
            >
              <EventIcon fontSize="small" />
              <span>Tenants</span>
            </Link>
            <Link
              href="/reports"
              className="text-white font-bold hover:text-blue-300 transition flex items-center space-x-2"
            >
              <AssessmentIcon fontSize="small" />
              <span>Reports</span>
            </Link>
            <Link
              href="/seatmap"
              className="text-white font-bold hover:text-blue-300 transition flex items-center space-x-2"
            >
              <MapIcon fontSize="small" />
              <span>Map</span>
            </Link>
            <Link
              href="/settings"
              className="text-white font-bold hover:text-blue-300 transition flex items-center space-x-2"
            >
              <SettingsIcon fontSize="small" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Account Links */}
          <div className="hidden md:flex space-x-6 items-center ml-4">
            <button className="text-white font-bold hover:text-blue-300 transition flex items-center space-x-2">
              <LoginIcon fontSize="small" />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile menu button (for future implementation) */}
          <button className="md:hidden flex flex-col justify-center items-center w-8 h-8">
            <span className="block w-6 h-0.5 bg-gray-300 mb-1.5"></span>
            <span className="block w-6 h-0.5 bg-gray-300 mb-1.5"></span>
            <span className="block w-6 h-0.5 bg-gray-300"></span>
          </button>
        </div>
      </header>
    </>
  );
}
