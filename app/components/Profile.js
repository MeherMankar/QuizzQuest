"use client"
import { useSession } from "next-auth/react";
import Image from "next/image"
import NavBar from "./NavBar";
import { useState, useEffect } from 'react';

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
                headers: {
                    'Content-Type': 'application/json',
                },
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
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
                    <div className="max-w-2xl mx-auto bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative">
                                <Image
                                    height={96}
                                    width={96}
                                    src={session.user.image}
                                    alt={`${session.user.email}'s profile picture`}
                                    className="rounded-full border-4 border-yellow-500 shadow-lg transform hover:scale-105 transition-all duration-200"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-800"></div>
                            </div>

                            <h2 className="text-2xl font-bold text-white">{session.user.name}</h2>
                            
                            <div className="w-full space-y-6">
                                <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-400">Name</span>
                                        <span className="text-white">{session.user.name || 'No name available'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-400">Email</span>
                                        <span className="text-white">{session.user.email}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-400">Role</span>
                                        <select
                                            value={role || ''}
                                            onChange={(e) => handleRoleChange(e.target.value)}
                                            className="bg-gray-700 text-white rounded-md p-2"
                                        >
                                            <option value="">Select Role</option>
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3 px-6 rounded-lg transform hover:scale-[1.02] transition-all duration-200 shadow-lg">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-white text-xl font-semibold bg-gray-800/30 backdrop-blur-lg rounded-lg p-8 shadow-lg">
                Not Signed in
            </div>
        </div>
    );
}
