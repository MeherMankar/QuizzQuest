"use client"
import { useSession } from "next-auth/react";
import Image from "next/image"
import NavBar from "./NavBar";
import { useState, useEffect } from 'react';

const roleBadge = {
    teacher: 'bg-green-500/20 text-green-300 border border-green-500/30',
    student: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    admin: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
};

export default function Profile() {
    const { data: session } = useSession();
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await fetch('/api/auth/user_roles');
                if (response.ok) {
                    const data = await response.json();
                    setRole(data.role);
                } else {
                    console.error('Failed to fetch role:', response.status);
                }
            } catch (error) {
                console.error('Error fetching role:', error);
            }
        };
        fetchRole();
    }, []);

    const handleRoleChange = async (newRole) => {
        try {
            const response = await fetch('/api/auth/user_roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (response.ok) {
                setRole(newRole);
            } else {
                console.error('Failed to update role:', response.status);
            }
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    if (session) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black py-6 px-4">
                    {/* Background orbs */}
                    <div className="pointer-events-none fixed inset-0 overflow-hidden">
                        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
                        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
                    </div>

                    <div className="relative max-w-lg mx-auto">
                        {/* Card */}
                        <div className="rounded-2xl border border-white/10 bg-gray-900/70 backdrop-blur-xl p-8 shadow-2xl">
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 blur-md opacity-40 scale-110" />
                                    <Image
                                        height={96}
                                        width={96}
                                        src={session.user.image}
                                        alt={`${session.user.name}'s profile picture`}
                                        className="relative rounded-full border-4 border-amber-500/50 shadow-xl"
                                    />
                                    <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-gray-900 shadow" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">{session.user.name}</h2>
                                {role && (
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${roleBadge[role] || roleBadge.student}`}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        {role}
                                    </span>
                                )}
                            </div>

                            {/* Info fields */}
                            <div className="space-y-3 mb-6">
                                {[
                                    { label: 'Name', value: session.user.name || 'No name available', icon: '👤' },
                                    { label: 'Email', value: session.user.email, icon: '📧' },
                                ].map((field) => (
                                    <div key={field.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                        <span className="flex items-center gap-2 text-sm text-gray-400">
                                            <span>{field.icon}</span>
                                            {field.label}
                                        </span>
                                        <span className="text-sm font-medium text-gray-200 truncate max-w-[200px]">{field.value}</span>
                                    </div>
                                ))}

                                {/* Role select */}
                                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    <span className="flex items-center gap-2 text-sm text-gray-400">
                                        <span>🎭</span>
                                        Role
                                    </span>
                                    <select
                                        value={role || ''}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                    </select>
                                </div>
                            </div>

                            {/* Edit button */}
                            <button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-gray-900 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] hover:shadow-amber-500/40">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-gray-800/50 backdrop-blur px-10 py-8 text-center shadow-xl">
                <div className="text-4xl mb-4">🔒</div>
                <p className="text-lg font-semibold text-white mb-1">Not Signed In</p>
                <p className="text-sm text-gray-400">Please sign in to view your profile.</p>
            </div>
        </div>
    );
}

