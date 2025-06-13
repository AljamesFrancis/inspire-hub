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
  // User state now also stores the role from Firestore
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Animation state

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch additional user data from Firestore
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where("uid", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);

          let userProfileData = {};
          if (!querySnapshot.empty) {
            userProfileData = querySnapshot.docs[0].data();
          }

          // Combine Firebase Auth user data with fetched Firestore profile data
          // Include the 'role' field
          setUser({
            ...currentUser,
            firstName: userProfileData.firstName || currentUser.displayName?.split(' ')[0] || '',
            lastName: userProfileData.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            role: userProfileData.role || 'user', // Default to 'user' if role isn't explicitly set
          });
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Fallback: If there's an error fetching from Firestore, just use the basic Firebase Auth user data
          setUser(currentUser);
        }
      } else {
        setUser(null); // No user logged in
      }
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((res) => setTimeout(res, 400));
    await signOut(auth);
    setUser(null);
    setIsLoggingOut(false);
  };

  // --- New Handler for Admin Button ---
  const handleAdminClick = () => {
    router.push('/dashboard'); 
  };
  // ------------------------------------

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
          {user ? (
            <>
              {/* Display firstName and lastName */}
              <span className="text-white font-semibold">
                Hello{' '}
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.displayName || user.email}
              </span>

              {/* --- Dynamic Admin Button --- */}
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
              {/* ---------------------------- */}

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