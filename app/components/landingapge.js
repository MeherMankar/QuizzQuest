"use client";
import NavBar from "./NavBar";
import "../global.css";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

export default function Component() {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCreateQuestion = () => {
    router.push('/teacher/questions');
  };
  const handleViewQuestions = () => {
    router.push('/viewquestions');
  };
  const handleSolveQuestions = () => {
    router.push('/viewquestions');
  };

  useEffect(() => {
    if (session) {
      const profilePic = session.user?.image;
      const userName = session.user?.name;

      if (profilePic) {
        localStorage.setItem("userProfilePic", profilePic);
      }
      if (userName) {
        localStorage.setItem("userName", userName);
      }

      const fetchRole = async () => {
        try {
          const response = await fetch('/api/auth/user_roles', {
            method: 'GET',
          });
          const data = await response.json();
          if (response.ok) {
            if (data.role === null) {
              // Auto-assign student role if no role exists
              await fetch('/api/auth/user_roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'student' }),
              });
              setRole('student');
            } else {
              setRole(data.role);
            }
          } else {
            console.error(data.error);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRole();
    } else {
      setLoading(false);
      localStorage.removeItem("userProfilePic");
      localStorage.removeItem("userName");
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                QuizQuest
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl">
              Transform learning into an adventure with interactive quizzes and games
            </p>
          </div>

          <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 transition-colors hover:border-gray-700">
              <div className="mb-3 text-3xl">🎮</div>
              <h3 className="mb-2 text-lg font-semibold text-amber-400">Interactive Games</h3>
              <p className="text-sm text-gray-400">Solve quizzes through engaging games that make learning fun and memorable</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 transition-colors hover:border-gray-700">
              <div className="mb-3 text-3xl">📚</div>
              <h3 className="mb-2 text-lg font-semibold text-purple-400">Smart Quizzes</h3>
              <p className="text-sm text-gray-400">AI-powered quiz generation and custom question creation for teachers</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 transition-colors hover:border-gray-700">
              <div className="mb-3 text-3xl">🏆</div>
              <h3 className="mb-2 text-lg font-semibold text-pink-400">Progress Tracking</h3>
              <p className="text-sm text-gray-400">Monitor performance with detailed analytics and competitive rankings</p>
            </div>
          </div>

          <div className="text-center">
            {!session ? (
              <div className="space-y-4">
                <button
                  onClick={() => signIn()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-semibold text-gray-900 transition-opacity hover:opacity-90"
                >
                  <span>🚀</span>
                  <span>Start Your Journey</span>
                </button>
                <p className="text-sm text-gray-500">Join thousands of learners worldwide</p>
              </div>
            ) : (
              <div className="space-y-4">
                {role === 'teacher' && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <button
                      onClick={handleCreateQuestion}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <span>✨</span>
                      <span>Create Questions</span>
                    </button>
                    <button
                      onClick={handleViewQuestions}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <span>📋</span>
                      <span>Manage Quizzes</span>
                    </button>
                  </div>
                )}

                {(role === 'student' || loading) && (
                  <button
                    onClick={handleSolveQuestions}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <span>🎮</span>
                    <span>Start Playing</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
