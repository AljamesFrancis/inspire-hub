'use client';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { auth, db } from '../../../../script/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Signup({ closeModal }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // New state to control the modal
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    setLoading(true); // Show loading spinner
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // Wait until Firebase auth state is fully recognized
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              companyName: formData.companyName,
              contact: formData.contact,
              createdAt: new Date()
            });

            setSuccessMessage('Registration successful!');
            setErrorMessage('');

            // Wait for 3 seconds before showing the success modal
            setTimeout(() => {
              setSuccessMessage(''); // Clear the first success message
              setShowSuccessModal(true); // Show the success modal
            }, 3000);

            // Reset the form data
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              companyName: '',
              contact: '',
              password: '',
              confirmPassword: ''
            });

            // After showing the success modal for 5 seconds, redirect to /main
            setTimeout(() => {
              router.push('/main');
              closeModal(); // Close the modal after redirection
            }, 10000);

          } catch (firestoreError) {
            console.error('Firestore write error:', firestoreError.message);
            setErrorMessage(firestoreError.message || 'Failed to save user data.');
            setLoading(false); // Stop the loading spinner if there's an error
          }
        }
      });
    } catch (error) {
      console.error('Auth error:', error.message);
      setErrorMessage(error.message || 'Registration failed.');
      setLoading(false); // Stop the loading spinner on failure
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-500/70 bg-opacity-50">
      <div className="bg-white/70 p-8 rounded-lg shadow-md w-full max-w-md overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {showSuccessModal ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50 mb-4"></div>
            <p className="text-blue-600 font-semibold">Successfully Registered! Redirecting to Dashboard...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border rounded"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border rounded"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border rounded"
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 cursor-pointer"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>

                  {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
            {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
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
