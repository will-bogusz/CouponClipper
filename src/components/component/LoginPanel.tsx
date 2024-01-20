import Link from "next/link";
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function LoginPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    try {
      // Send POST request to your API route
      const response = await axios.post('/api/login', { email: username, password });
      const { token } = response.data;

      // Use global state management to handle user authentication
      // Assuming the token and username are all you need to store
      login({ token, username });

      // Redirect to home page on successful login
      router.push('/');
    } catch (error) {
      // Handle errors here, such as displaying a message to the user
      console.error('Login failed', error);
      setError('Username/password incorrect!');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 px-4 py-8 bg-white shadow-md rounded-md dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Login</h2>
      {error && <div className="mt-4 bg-red-200 text-red-700 p-2 rounded-md">
        <p className="text-sm">Invalid username or password. Please try again.</p>
      </div>}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="username">
            Username
          </label>
          <input
            className="mt-1 w-full px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700"
            id="username"
            placeholder="Enter your username"
            required
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">
              Password
            </label>
            <Link className="text-sm text-blue-600 hover:underline dark:text-blue-400" href="#">
              Forgot your password?
            </Link>
          </div>
          <input
            className="mt-1 w-full px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700"
            id="password"
            placeholder="Enter your password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button
            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-500"
            type="submit"
          >
            Login
          </button>
        </div>
      </form>
      <p className="mt-4 text-center">
        Don&apos;t have an account?&nbsp;
        <Link className="text-blue-600 hover:underline dark:text-blue-400" href="/create">
          Sign up
        </Link>
      </p>
    </div>
  );
}

