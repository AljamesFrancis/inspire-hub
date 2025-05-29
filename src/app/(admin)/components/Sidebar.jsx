'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-md md:hidden"
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {/* Sidebar Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-40 shadow transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        ref={ref}
      >
        <div className="p-4 text-xl font-bold border-b border-white/20 flex justify-between items-center">
          Dashboard
          {/* Close button on mobile */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-white text-2xl leading-none"
            aria-label="Close sidebar"
          >
            &times;
          </button>
        </div>
        <nav className="p-4 space-y-4">
          <Link href="/dashboard" className="block hover:underline">🏠 Home</Link>
          <Link href="/table" className="block hover:underline">👥 tables</Link>
          <Link href="/reservations" className="block hover:underline">📅 Reservations</Link>
          <Link href="/reports" className="block hover:underline">📊 Reports</Link>
          <Link href="/settings" className="block hover:underline">⚙️ Settings</Link>
        </nav>
      </aside>
    </>
  );
}
