import React, { useState } from 'react';
import Link from 'next/link';

export function SignUpPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSignUp = (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    // Add logic here for handling the actual sign up process
    // e.g., sending data to a server

    setPasswordError('');
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 px-4 py-8 bg-white shadow-md rounded-md dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Sign Up</h2>
      <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="signup-username">
            Username
          </label>
          <input
            className="mt-1 w-full px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700"
            id="signup-username"
            placeholder="Enter your username"
            required
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="signup-password">
            Password
          </label>
          <input
            className="mt-1 w-full px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700"
            id="signup-password"
            placeholder="Enter your password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            className="mt-1 w-full px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700"
            id="confirm-password"
            placeholder="Confirm your password"
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
        </div>
        <div>
          <button
            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-500"
            type="submit"
          >
            Sign Up
          </button>
        </div>
      </form>
      <p className="mt-4 text-center">
        Already have an account?&nbsp;
        <Link className="text-blue-600 hover:underline dark:text-blue-400" href="/login">
          Login
        </Link>
      </p>
    </div>
  );
}
