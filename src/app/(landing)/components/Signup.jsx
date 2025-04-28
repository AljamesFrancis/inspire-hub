'use client';
import { useState } from 'react';
import { db } from '../../../../script/firebaseConfig'; // adjust the path if needed
import { collection, addDoc } from 'firebase/firestore';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons for toggle

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        companyName: formData.companyName,
        contact: formData.contact,
        password: formData.password // Be sure to hash passwords before storing in real applications
      });
      setSuccessMessage('Registration successful!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        companyName: '',
        contact: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error adding document: ', error);
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-500/70 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* First and Last Name fields side by side */}
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
              required
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

          {/* Password and Confirm Password Fields */}
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
            </div>
          </div>

          {/* Register and Close buttons on the same line */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Sign up
            </button>
            <button
              onClick={closeModal}
              className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
