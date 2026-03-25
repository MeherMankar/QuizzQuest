'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (role) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/user_roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Redirect to a different page after successful signup, or show success message
      alert('Signup successful! Redirecting...');
      router.push('/'); // or wherever you want to navigate after signup
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Signup for QuizQuest</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => handleSignup('teacher')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
          disabled={loading}
        >
          Signup as Teacher
        </button>
        <button
          onClick={() => handleSignup('student')}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold"
          disabled={loading}
        >
          Signup as Student
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {loading && <p className="mt-4">Processing...</p>}
    </div>
  );
}
