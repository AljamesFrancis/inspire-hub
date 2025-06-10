'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Signup from '../components/Signup'; // Adjust paths as needed
import Login from '../components/Login';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../script/firebaseConfig';
import { useRouter } from 'next/navigation';

export default function Topnav() {
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Signup modal
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Login modal
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Animation state

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const openSignupModal = () => {
    setIsModalOpen(true);
  };

  const closeSignupModal = () => {
    setIsModalOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  // Add animation for logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((res) => setTimeout(res, 400)); // Optional: small delay for animation
    await signOut(auth);
    setUser(null);
    setIsLoggingOut(false);
  };

  // Book a Visit handler: require login before navigation
  const handleBookVisit = () => {
    if (user) {
      router.push('/main');
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      {/* Logout Animation Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 transition-opacity animate-fadeout">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-yellow-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-white text-lg font-bold">Logging out...</span>
          </div>
        </div>
      )}

      <nav
        className={`w-full fixed top-0 left-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
          scrolled ? 'bg-[#2b2b2b] shadow-md' : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/images/inspirelogo.png"
            alt="Website Logo"
            width={40}
            height={40}
          />
          <span className="text-white font-bold text-lg">Inspire Hub</span>
        </div>

        {/* Navigation Links */}
        <div className="space-x-6 flex items-center">
          {/* Book a Visit Button */}
          <button
            onClick={handleBookVisit}
            className="bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-2 px-6 rounded-lg shadow-lg inline-block"
          >
            Book a Visit
          </button>

          {/* If logged in, show user's email and logout, else show sign up & login */}
          {user ? (
            <>
              <span className="text-white font-semibold">{user.email}</span>
              <button
                onClick={handleLogout}
                className={`font-bold transition ${
                  scrolled
                    ? 'bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-orange-600'
                    : 'text-white hover:text-blue-300'
                }`}
                disabled={isLoggingOut}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Sign Up Button */}
              <button
                onClick={openSignupModal}
                className="text-white font-bold hover:text-blue-300 transition"
              >
                Sign up
              </button>

              {/* Login Button */}
              <button
                onClick={openLoginModal}
                className={`font-bold transition ${
                  scrolled
                    ? 'bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-orange-600'
                    : 'text-white hover:text-blue-300'
                }`}
              >
                Login
              </button>
            </>
          )}
        </div>

        {/* Render Signup Modal */}
        {isModalOpen && <Signup closeModal={closeSignupModal} />}

        {/* Render Login Modal */}
        {isLoginOpen && <Login closeModal={closeLoginModal} />}
      </nav>

      {/* TailwindCSS keyframes for fadeout (add this to your global.css if not present):
      @keyframes fadeout {
        0% { opacity: 1; }
        100% { opacity: 0.5; }
      }
      .animate-fadeout {
        animation: fadeout 0.4s;
      }
      */}
    </>
  );
}