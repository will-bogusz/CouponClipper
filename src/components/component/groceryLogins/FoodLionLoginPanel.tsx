import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';

export function FoodLionLoginPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Set a timeout of 180 seconds (3 minutes) to accommodate the API's potential response time
      const source = axios.CancelToken.source();
      const timeoutId = setTimeout(() => {
        source.cancel(`Operation canceled due to timeout.`);
      }, 300000); // 180 seconds timeout

      const response = await axios.post('/api/grocery/foodlion', { email: { username }, password: { password }, mode: "validate" }, { cancelToken: source.token, timeout: 300000 });
      clearTimeout(timeoutId); // Clear the timeout if the request completes in time

      console.log('Response:', response);

      const { status, message } = response.data;
      // log response data
      console.log(response.data);

      if (status === 'success') {
        // Use the /pages/api/user/encrypt.ts API to encrypt the password
        try {
          const encryptionResponse = await axios.post('/api/user/encrypt', { text: password, userSpecificElement: username });
          const { iv, content } = encryptionResponse.data; // Destructuring to get iv and content from the encryption response

          if (!user) {
            console.error('User is not authenticated');
            setError('User is not authenticated. Please login.');
            setLoading(false);
            return;
          }

          await axios.post('/api/user/update', {
            field: "linkedStores.$[elem].credentials",
            value: {
              email: username,
              encryptedCredentials: {
                iv: iv,
                content: content
              }
            },
            arrayFilters: [{"elem.storeName": "Food Lion"}]
          }, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            }
          });
          await axios.post('/api/user/update', {
            field: "linkedStores.$[elem].isLinked",
            value: true,
            arrayFilters: [{"elem.storeName": "Food Lion"}]
          }, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            }
          });

          router.push('/dashboard');
        } catch (encryptionError) {
          console.error('Encryption failed', encryptionError);
          setError('Failed to encrypt password. Please try again later.');
          setLoading(false);
        }
      } else {
        console.error('Login failed', message);
        setError(message);
      }
    } catch (error) {
      console.error('Login failed', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 px-4 py-8 bg-white shadow-md rounded-md dark:bg-gray-800">
      <div className="flex justify-center">
        <img src="/logos/food-lion.png" alt="Food Lion Logo" className="w-32 h-32 object-contain" />
      </div>
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">Food Lion</h1>
      <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Login</h2>
      {error && <div className="mt-4 bg-red-200 text-red-700 p-2 rounded-md">
        <p className="text-sm">{error}</p>
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">
            Password
          </label>
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
        <div className="flex justify-center items-center">
          <button
            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-500"
            type="submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
