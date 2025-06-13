import React, { useState, useEffect } from 'react';
import { db, auth } from "../../../../script/firebaseConfig";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SettingsPage = () => {
  // User profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '', // Stored in Firestore, not directly in Firebase Auth
    notifications: true,
    darkMode: false,
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Email change state (for re-authentication)
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: '',
    currentPasswordForEmail: '',
  });
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);

  // --- Fetch User Data on Component Mount ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        setLoading(true);
        try {
          // Get user details from Firebase Auth
          const user = auth.currentUser;
          let currentProfile = {
            name: user.displayName || '',
            email: user.email || '',
            phone: '', // Default, will be overwritten if exists in Firestore
            notifications: true, // Default
            darkMode: false, // Default
          };

          // Get additional user data from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data();
            currentProfile = {
              ...currentProfile,
              phone: firestoreData.phone || '',
              notifications: firestoreData.notifications !== undefined ? firestoreData.notifications : true,
              darkMode: firestoreData.darkMode !== undefined ? firestoreData.darkMode : false,
            };
          }
          setProfile(currentProfile);
          setEmailChangeData(prev => ({ ...prev, newEmail: user.email || '' })); // Initialize newEmail with current email
        } catch (error) {
          console.error("Error fetching user data:", error);
          setProfileError("Failed to load user data.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        // Handle case where no user is logged in (e.g., redirect to login)
        console.log("No user logged in.");
      }
    };

    fetchUserData();
  }, []); // Run once on component mount

  // --- Handle Profile Changes (local state) ---
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- Handle Email Change (local state) ---
  const handleEmailChangeInput = (e) => {
    const { name, value } = e.target;
    setEmailChangeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Handle Password Changes (local state) ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Submit Profile Changes to Firebase ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaveMessage('');
    setProfileError('');

    if (!auth.currentUser) {
      setProfileError("No user logged in.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: profile.name
      });

      // Update additional profile data in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        phone: profile.phone,
        notifications: profile.notifications,
        darkMode: profile.darkMode,
      }, { merge: true }); // Use merge: true to avoid overwriting other fields

      setProfileSaveMessage('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => { // Clear messages after a few seconds
        setProfileSaveMessage('');
        setProfileError('');
      }, 3000);
    }
  };

  // --- Submit Email Change to Firebase ---
  const handleEmailChangeSubmit = async (e) => {
    e.preventDefault();
    setEmailChangeError('');
    setEmailChangeSuccess(false);

    if (!auth.currentUser) {
      setEmailChangeError("No user logged in.");
      return;
    }

    if (!emailChangeData.newEmail) {
      setEmailChangeError("New email cannot be empty.");
      return;
    }

    if (emailChangeData.newEmail === auth.currentUser.email) {
      setEmailChangeError("New email is the same as the current email.");
      return;
    }

    if (!emailChangeData.currentPasswordForEmail) {
      setEmailChangeError("Please enter your current password to change email.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, emailChangeData.currentPasswordForEmail);

      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, emailChangeData.newEmail);

      setProfile(prev => ({ ...prev, email: emailChangeData.newEmail })); // Update local state
      setEmailChangeSuccess(true);
      setEmailChangeData(prev => ({ ...prev, currentPasswordForEmail: '' })); // Clear password field
      setEmailChangeError(''); // Clear any previous errors
    } catch (error) {
      console.error("Error updating email:", error);
      setEmailChangeError(`Failed to update email: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setEmailChangeSuccess(false);
        setEmailChangeError('');
      }, 3000);
    }
  };

  // --- Submit Password Change to Firebase ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!auth.currentUser) {
      setPasswordError("No user logged in.");
      return;
    }

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      // Re-authenticate the user before changing password
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error("Error changing password:", error);
      // Firebase error codes for password changes
      if (error.code === 'auth/wrong-password') {
        setPasswordError("Incorrect current password.");
      } else if (error.code === 'auth/weak-password') {
        setPasswordError("New password is too weak. Please choose a stronger one.");
      } else {
        setPasswordError(`Failed to change password: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setTimeout(() => { // Clear messages after a few seconds
        setPasswordSuccess(false);
        setPasswordError('');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-600">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Account Settings</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Information Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {profileError && (
              <div className="text-red-600 text-sm">{profileError}</div>
            )}
            {profileSaveMessage && (
              <div className="text-green-600 text-sm">{profileSaveMessage}</div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Email Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Email</h2>
          <form onSubmit={handleEmailChangeSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 mb-1">Current Email</label>
              <input
                type="email"
                id="currentEmail"
                name="currentEmail"
                value={profile.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
              <input
                type="email"
                id="newEmail"
                name="newEmail"
                value={emailChangeData.newEmail}
                onChange={handleEmailChangeInput}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="currentPasswordForEmail" className="block text-sm font-medium text-gray-700 mb-1">Current Password (for email change)</label>
              <input
                type="password"
                id="currentPasswordForEmail"
                name="currentPasswordForEmail"
                value={emailChangeData.currentPasswordForEmail}
                onChange={handleEmailChangeInput}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            {emailChangeError && (
              <div className="text-red-600 text-sm">{emailChangeError}</div>
            )}
            {emailChangeSuccess && (
              <div className="text-green-600 text-sm">Email updated successfully! Please re-login with your new email.</div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Change Email'}
              </button>
            </div>
          </form>
        </div>


        {/* Change Password Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            {passwordError && (
              <div className="text-red-600 text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-green-600 text-sm">Password changed successfully!</div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={profile.notifications}
                onChange={handleProfileChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                name="darkMode"
                checked={profile.darkMode}
                onChange={handleProfileChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
                Dark Mode
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="button" // This is a button, not a form submit
                onClick={handleUpdateProfile} // Call the update profile function
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;