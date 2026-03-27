'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Signup() {
  const router = useRouter();

  useEffect(() => {
    const assignStudentRole = async () => {
      try {
        const response = await fetch('/api/auth/user_roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'student' }),
        });

        if (response.ok) {
          router.push('/');
        }
      } catch (err) {
        console.error('Error assigning role:', err);
      }
    };

    assignStudentRole();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-lg">Setting up your account...</p>
      </div>
    </div>
  );
}
