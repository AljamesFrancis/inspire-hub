'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../script/firebaseConfig';

export default function Login({ closeModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const trimmedEmail = email.trim().toLowerCase();
      setLoading(true);  // Show loading spinner
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      setErrorMessage('');

      // Wait for 5 seconds before redirecting
      setTimeout(() => {
        // Redirect to /main after 5 seconds
        router.push('/main');

        // Close modal after the redirect is triggered
        if (closeModal) closeModal();
      }, 5000);
    } catch (error) {
      console.error('Login failed:', error.code, error.message);
      setLoading(false); // Stop the loading spinner

      switch (error.code) {
        case 'auth/user-not-found':
          setErrorMessage('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setErrorMessage('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Invalid email format.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Too many attempts. Please try again later.');
          break;
        default:
          setErrorMessage('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
  <div className="bg-white rounded-lg shadow-md w-full max-w-xs overflow-y-auto" style={{ maxHeight: '90vh' }}>
    
  <div className="bg-gray-500/70 p-4 rounded-t text-center">
  <div className="flex justify-center items-center space-x-2">
    <img
      src="/images/inspirelogo.png" // Replace with your actual image path
      alt="I-Hub Logo"
      className="w-8 h-8 object-contain"
    />
    <h1 className="text-2xl font-bold text-white">I-Hub</h1>
  </div>
  <h3 className="text-sm font-normal text-white mt-1">Inspire Inc.</h3>
</div>





    {loading ? (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50 mb-4"></div>
        <p className="text-blue-600 font-semibold text-center text-sm px-4">
          Logging in... Redirecting to dashboard
        </p>
      </div>
    ) : (
      <>
        {errorMessage && <p className="text-red-600 text-center mt-4 text-sm px-4">{errorMessage}</p>}

        <form onSubmit={handleLogin} className="flex flex-col items-center justify-center gap-4 py-8 px-4">
          <div className="w-full">
            <label className="block text-gray-700 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 border rounded text-sm"
            />
          </div>

          <div className="w-full">
            <label className="block text-gray-700 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full p-2 border rounded text-sm"
            />
          </div>

          <div className="flex space-x-4 w-full pt-2">
            <button
              type="submit"
              className="w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded text-sm"
            >
              Login
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded text-sm"
            >
              Close
            </button>
          </div>
        </form>
      </>
    )}
  </div>
</div>

  );

}