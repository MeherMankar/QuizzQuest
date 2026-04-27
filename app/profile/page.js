"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import NavBar from "../components/NavBar";

export default function ProfilePage() {
  return (
    <SessionProvider>
      <ProfileContent />
    </SessionProvider>
  );
}

function ProfileContent() {
  const { data: session } = useSession();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch('/api/auth/user_roles', { method: 'GET' })
        .then(r => r.json())
        .then(data => setRole(data.role || 'student'))
        .catch(() => setRole('student'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <p className="text-gray-500">Not signed in</p>
        </div>
      </>
    );
  }

  const roleColors = {
    teacher: 'bg-green-500/20 text-green-300 border-green-500/30',
    student: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-950 pt-4 pb-16 px-4">
        {/* Ambient background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-2 font-mono">/ profile</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Profile</span>
            </h1>
          </div>

          {/* Profile Card */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-white/5 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col items-center text-center mb-8">
              {/* Avatar */}
              {session.user.image ? (
                <div className="relative mb-4">
                  <img
                    src={session.user.image}
                    alt="profile"
                    className="h-24 w-24 rounded-full ring-4 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  />
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 ring-4 ring-gray-900" />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-4xl font-bold text-white mb-4 ring-4 ring-amber-500/50">
                  {session.user.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}

              {/* Name */}
              <h2 className="text-2xl font-bold text-white mb-2">{session.user.name}</h2>
              
              {/* Role Badge */}
              {loading ? (
                <div className="h-6 w-20 bg-gray-800 animate-pulse rounded-full" />
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[role] || roleColors.student}`}>
                  {role === 'teacher' && '👨‍🏫'}
                  {role === 'student' && '🎓'}
                  {role === 'admin' && '👑'}
                  <span className="capitalize">{role || 'student'}</span>
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm text-gray-300">{session.user.email}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-sm font-medium text-gray-500">Name</span>
                <span className="text-sm text-gray-300">{session.user.name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-500">Account Type</span>
                <span className="text-sm text-gray-300 capitalize">{role || 'student'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
