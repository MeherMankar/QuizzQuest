"use client";
import NavBar from "./NavBar";
import "../global.css";
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

export default function Component() {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSignup = () => {
    router.push('/signuppage');
  };

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
            setRole(data.role);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <NavBar />
      
      <main className="pt-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                QuizQuest
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform learning into an adventure with interactive quizzes and games
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-3 text-yellow-400">Interactive Games</h3>
              <p className="text-gray-300">Solve quizzes through engaging games that make learning fun and memorable</p>
            </div>
            <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-purple-400">Smart Quizzes</h3>
              <p className="text-gray-300">AI-powered quiz generation and custom question creation for teachers</p>
            </div>
            <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-3 text-pink-400">Progress Tracking</h3>
              <p className="text-gray-300">Monitor performance with detailed analytics and competitive rankings</p>
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center">
            {!session ? (
              <div className="space-y-6">
                <button
                  onClick={() => signIn()}
                  className="group relative px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  <span className="relative z-10">🚀 Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <p className="text-gray-400">Join thousands of learners worldwide</p>
              </div>
            ) : (
              <div className="space-y-6">
                {!loading && role === null && (
                  <button
                    onClick={handleSignup}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    🎯 Choose Your Path
                  </button>
                )}

                {role === 'teacher' && (
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                      onClick={handleCreateQuestion}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                      ✨ Create Questions
                    </button>
                    <button
                      onClick={handleViewQuestions}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                      📋 Manage Quizzes
                    </button>
                  </div>
                )}

                {role === 'student' && (
                  <button
                    onClick={handleSolveQuestions}
                    className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    🎮 Start Playing
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
