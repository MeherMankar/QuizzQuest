"use client";
import NavBar from "./NavBar";
import "../global.css";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

const features = [
  {
    icon: "🎮",
    title: "Interactive Games",
    description: "Solve quizzes through engaging games — catch falling answers, memory cards, and more!",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400/60",
    textColor: "text-amber-400",
  },
  {
    icon: "🤖",
    title: "AI-Powered Quizzes",
    description: "Generate smart quizzes on any topic in seconds using cutting-edge AI technology.",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400/60",
    textColor: "text-purple-400",
  },
  {
    icon: "📚",
    title: "Teacher Dashboard",
    description: "Create, manage, and assign custom question sets to your students effortlessly.",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/60",
    textColor: "text-blue-400",
  },
  {
    icon: "♟️",
    title: "Chess Arena",
    description: "Challenge yourself with chess puzzles and games integrated directly in the platform.",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400/60",
    textColor: "text-green-400",
  },
  {
    icon: "🏆",
    title: "Leaderboard",
    description: "Compete with peers and climb the rankings. Track your progress over time.",
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 hover:border-rose-400/60",
    textColor: "text-rose-400",
  },
  {
    icon: "📊",
    title: "Detailed Statistics",
    description: "View in-depth performance analytics and identify areas for improvement.",
    color: "from-teal-500/20 to-cyan-500/20 border-teal-500/30 hover:border-teal-400/60",
    textColor: "text-teal-400",
  },
];

const stats = [
  { label: "Quiz Modes", value: "4+" },
  { label: "Game Types", value: "3" },
  { label: "AI-Powered", value: "Yes" },
  { label: "Roles", value: "3" },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCreateQuestion = () => router.push('/teacher/questions');
  const handleViewQuestions = () => router.push('/viewquestions');
  const handlePlayGames = () => router.push('/solvingarea');

  useEffect(() => {
    if (session) {
      const profilePic = session.user?.image;
      const userName = session.user?.name;

      if (profilePic) localStorage.setItem("userProfilePic", profilePic);
      if (userName) localStorage.setItem("userName", userName);

      const fetchRole = async () => {
        try {
          const response = await fetch('/api/auth/user_roles', { method: 'GET' });
          const data = await response.json();
          if (response.ok) {
            if (data.role === null) {
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
            setRole('student');
          }
        } catch {
          setRole('student');
        } finally {
          setLoading(false);
        }
      };
      fetchRole();
    } else {
      setLoading(false);
      setRole(null);
      localStorage.removeItem("userProfilePic");
      localStorage.removeItem("userName");
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      <NavBar />

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="mx-auto max-w-6xl">

          {/* Badge */}
          <div className="mb-6 flex justify-center animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              MCA College Project — Vidya Bharti Mahavidyalaya
            </span>
          </div>

          {/* Headline */}
          <div className="mb-8 text-center animate-slide-up">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-tight">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                QuizzQuest
              </span>
              <br />
              <span className="text-white text-4xl sm:text-5xl font-bold">
                Learn Through Play
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed">
              Transform education into an adventure. Solve quizzes through interactive games,
              challenge the AI, battle on the leaderboard, and master any subject.
            </p>
          </div>

          {/* Stats bar */}
          <div className="mb-16 flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-gray-700/50 bg-gray-700/30">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-gray-900/60 backdrop-blur px-8 py-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mb-20 text-center">
            {loading ? (
              <div className="inline-flex items-center gap-3 rounded-xl bg-gray-800/60 px-8 py-4 font-semibold text-gray-400 border border-gray-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-amber-400"></div>
                <span>Loading your experience...</span>
              </div>
            ) : !session ? (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <button
                  onClick={() => signIn()}
                  className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-4 text-lg font-bold text-gray-900 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-amber-500/40 hover:scale-105"
                >
                  <span>🚀</span>
                  <span>Start Your Journey</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <p className="text-sm text-gray-500">Join our learning community · Free forever</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <p className="text-gray-400 mb-2">
                  Welcome back, <span className="text-amber-400 font-semibold">{session.user?.name?.split(' ')[0]}</span>! 👋
                </p>
                {role === 'teacher' && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      onClick={handleCreateQuestion}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:shadow-green-500/40"
                    >
                      <span>✨</span>
                      <span>Create Questions</span>
                    </button>
                    <button
                      onClick={handleViewQuestions}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-blue-500/40"
                    >
                      <span>📋</span>
                      <span>Manage Quizzes</span>
                    </button>
                  </div>
                )}
                {role === 'student' && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      onClick={handlePlayGames}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105 hover:shadow-purple-500/40"
                    >
                      <span>🎮</span>
                      <span>Play Games</span>
                    </button>
                    <button
                      onClick={handleViewQuestions}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3.5 font-semibold text-gray-900 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/40"
                    >
                      <span>📝</span>
                      <span>Take Quiz</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">
              Everything You Need
            </h2>
            <h3 className="mb-10 text-center text-3xl font-bold text-white">
              A Complete Learning Platform
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${feature.color} p-6 backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}
                >
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className={`mb-2 text-lg font-bold ${feature.textColor}`}>{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 p-10 text-center backdrop-blur">
            <h3 className="mb-3 text-2xl font-bold text-white">Ready to level up your learning?</h3>
            <p className="mb-6 text-gray-400">Join QuizzQuest and make every study session an adventure.</p>
            {!session && (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 font-bold text-gray-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30"
              >
                <span>Get Started Free</span>
                <span>→</span>
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
