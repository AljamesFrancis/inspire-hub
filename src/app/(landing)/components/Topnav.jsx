'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Signup from '../components/Signup'; // Adjust paths as needed
import Login from '../components/Login';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../../../script/firebaseConfig'; // Import 'db' from your firebaseConfig
import { collection, getDocs, query, where } from 'firebase/firestore'; // Import Firestore functions
import { useRouter } from 'next/navigation';

export default function Topnav() {
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Signup modal
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Login modal
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Animation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where("uid", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);

          let userProfileData = {};
          if (!querySnapshot.empty) {
            userProfileData = querySnapshot.docs[0].data();
          }

          setUser({
            ...currentUser,
            firstName: userProfileData.firstName || currentUser.displayName?.split(' ')[0] || '',
            lastName: userProfileData.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            role: userProfileData.role || 'user',
          });
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const openSignupModal = () => {
    setIsModalOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu when opening modal
  };

  const closeSignupModal = () => {
    setIsModalOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu when opening modal
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    await new Promise((res) => setTimeout(res, 400));
    await signOut(auth);
    setUser(null);
    setIsLoggingOut(false);
  };

  const handleAdminClick = () => {
    router.push('/dashboard');
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
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

        {/* Mobile Menu Button (Hamburger) */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-6 items-center">
          {user ? (
            <>
              <span className="text-white font-semibold">
                Hello{' '}
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.displayName || user.email}
              </span>
              {user.role === "admin" && (
                <button
                  onClick={handleAdminClick}
                  className={`font-bold transition px-4 py-2 rounded
                    ${scrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}
                  `}
                >
                  Admin Panel
                </button>
              )}
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
              <button
                onClick={openSignupModal}
                className="text-white font-bold hover:text-blue-300 transition"
              >
                Sign up
              </button>
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
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-[#2b2b2b] z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {user ? (
            <>
              <span className="text-white text-2xl font-semibold">
                Hello{' '}
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.displayName || user.email}
              </span>
              {user.role === "admin" && (
                <button
                  onClick={handleAdminClick}
                  className="bg-blue-600 text-white font-bold px-6 py-3 rounded text-xl hover:bg-blue-700 transition"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded text-xl hover:bg-orange-600 transition"
                disabled={isLoggingOut}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={openSignupModal}
                className="text-white font-bold text-2xl hover:text-blue-300 transition"
              >
                Sign up
              </button>
              <button
                onClick={openLoginModal}
                className="bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded text-xl hover:bg-orange-600 transition"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>

      {/* Render Signup Modal */}
      {isModalOpen && <Signup closeModal={closeSignupModal} />}

      {/* Render Login Modal */}
      {isLoginOpen && <Login closeModal={closeLoginModal} />}

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