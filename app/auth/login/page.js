'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg transform transition-all duration-500 ease-out animate-fade-in-down">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to continue</p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={handleSignIn}
            className={`w-full px-4 py-2 text-white font-semibold bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account? <a href="#" className="text-indigo-600">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
