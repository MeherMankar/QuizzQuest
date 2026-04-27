'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '../components/NavBar';

const QUICK_ACTIONS = [
  {
    icon: '🤖',
    label: 'AI Quiz',
    sub: 'Generate quiz on any topic',
    color: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20 hover:shadow-purple-500/40',
    path: '/autoquiz',
  },
  {
    icon: '📋',
    label: 'View Questions',
    sub: 'Take a teacher-made quiz',
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20 hover:shadow-blue-500/40',
    path: '/viewquestions',
  },
];

export default function QuizzesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-950 pt-4 pb-16 px-4">
        {/* Ambient background blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-2 font-mono">/ quizzes</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Choose how you<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">want to learn</span>
            </h1>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.path)}
                className={`group relative overflow-hidden rounded-xl border border-white/5 bg-gray-900 p-5 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg ${action.shadow}`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${action.color} opacity-0`} style={{opacity: 0}} />
                <div className="relative">
                  <div className="text-2xl mb-3">{action.icon}</div>
                  <div className="font-bold text-white text-sm">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{action.sub}</div>
                </div>
                <div className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${action.color} group-hover:w-full transition-all duration-300`} />
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
