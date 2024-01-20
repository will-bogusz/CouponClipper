import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function SignUpPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSignUp = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Send POST request to your API route
      const response = await axios.post('/api/signup', { email: username, password });
      const { token } = response.data;

      login({ token, username });

      // Update UI or redirect as necessary
      console.log('Sign up successful', token);
      router.push('/');
    } catch (error: any) {
      // Handle errors, such as displaying a message to the user
      setError(error?.response?.data?.error || 'Sign up failed');
    }

    setError('');
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
          {error && <p className="text-red-500 text-xs">{error}</p>}
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
