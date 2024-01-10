/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/QpedrALMcue
 */

/** 
 * this is //src/components/component/login-panel.tsx
*/
import Link from "next/link"

export function LoginPanel() {
  return (
    <div className="w-full max-w-md mx-auto mt-10 px-4 py-8 bg-white shadow-md rounded-md dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Login</h2>
      <form className="mt-8 space-y-6">
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
        <Link className="text-blue-600 hover:underline dark:text-blue-400" href="#">
          Sign up
        </Link>
      </p>
    </div>
  )
}
