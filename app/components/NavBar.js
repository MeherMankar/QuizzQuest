'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBars, faTimes, faRankingStar, faGamepad, faChess, faUser, faInfoCircle, faSignOutAlt, faClipboardList, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { signOut, useSession } from 'next-auth/react';

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [canSwitchRole, setCanSwitchRole] = useState(false);
    const [currentRole, setCurrentRole] = useState('student');
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();

    useEffect(() => {
        setUserProfilePic(localStorage.getItem("userProfilePic"));
        
        // Check if user can switch roles
        const checkRolePermission = async () => {
            try {
                const response = await fetch('/api/auth/can-switch-role');
                if (response.ok) {
                    const data = await response.json();
                    setCanSwitchRole(data.canSwitch);
                    setCurrentRole(data.currentRole);
                }
            } catch (error) {
                console.error('Error checking role permission:', error);
            }
        };
        
        if (session?.user) {
            checkRolePermission();
        }
    }, [session]);

    const ToggleMenu = (open) => {
        setIsOpen(open !== undefined ? open : !isOpen);
    };

    const handleRoleSwitch = async (role) => {
        if (!canSwitchRole) {
            alert('Only teachers can switch roles. Contact admin to become a teacher.');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/user_roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role }),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Update the session with the new role
                await updateSession({
                    ...session,
                    user: {
                        ...session.user,
                        role: role
                    }
                });

                setCurrentRole(role);
                setIsOpen(false);
                router.refresh();
            } else {
                alert(data.error || 'Failed to switch role');
            }
        } catch (error) {
            console.error('Error switching role:', error);
            alert('Failed to switch role');
        }
    };

    const navigationItems = [
        { label: 'Home', icon: faHome, action: () => router.push('/') },
        { label: 'Quizzes', icon: faClipboardList, action: () => router.push('/quizzes') },
        { label: 'Rankings', icon: faRankingStar, action: () => router.push('/rankings') },
        { label: 'Statistics', icon: faChartBar, action: () => router.push('/statistics') },
        { label: 'Auto Quiz', icon: faGamepad, action: () => router.push('/autoquiz') },
        { label: 'Chess', icon: faChess, action: () => router.push('/chess') },
        { label: 'Profile', icon: faUser, action: () => router.push('/profile') },
        { label: 'About Us', icon: faInfoCircle, action: () => router.push('/aboutus') }
    ];

    // Color map for nav items
    const iconColors = [
        'text-amber-400',    // Home
        'text-blue-400',     // Quizzes
        'text-yellow-400',   // Rankings
        'text-teal-400',     // Statistics
        'text-purple-400',   // Auto Quiz
        'text-green-400',    // Chess
        'text-pink-400',     // Profile
        'text-orange-400',   // About Us
    ];

    const navHoverColors = [
        'hover:text-amber-300 hover:bg-amber-500/10',
        'hover:text-blue-300 hover:bg-blue-500/10',
        'hover:text-yellow-300 hover:bg-yellow-500/10',
        'hover:text-teal-300 hover:bg-teal-500/10',
        'hover:text-purple-300 hover:bg-purple-500/10',
        'hover:text-green-300 hover:bg-green-500/10',
        'hover:text-pink-300 hover:bg-pink-500/10',
        'hover:text-orange-300 hover:bg-orange-500/10',
    ];

    return (
        <>
            {/* Header */}
            <header className="fixed top-0 z-40 w-full border-b border-white/5 bg-gray-950/90 backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <button
                            onClick={() => router.push('/')}
                            className="text-xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent transition-opacity hover:opacity-80"
                        >
                            QuizzQuest
                        </button>

                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-1 md:flex">
                            {navigationItems.slice(1, -1).map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all duration-150 ${navHoverColors[index + 1]}`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className={`h-3.5 w-3.5 ${iconColors[index + 1]}`} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* Profile / hamburger */}
                        <button
                            onClick={() => ToggleMenu()}
                            className="flex items-center gap-2 rounded-lg p-1.5 transition-all hover:bg-white/5"
                        >
                            {userProfilePic ? (
                                <img
                                    src={userProfilePic}
                                    alt="profile"
                                    className="h-8 w-8 rounded-full ring-2 ring-amber-500 shadow-lg shadow-amber-500/20"
                                />
                            ) : null}
                            <div className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${isOpen ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-gray-200'}`}>
                                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-4 w-4" />
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div className={`fixed right-0 top-0 z-50 h-full w-72 border-l border-white/5 bg-gray-950 shadow-2xl transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                    <span className="text-base font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        QuizzQuest
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                </div>

                {/* User info */}
                {userProfilePic && (
                    <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
                        <img src={userProfilePic} alt="profile" className="h-9 w-9 rounded-full ring-2 ring-amber-500/50" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-200">{session?.user?.name || 'User'}</p>
                            <p className="truncate text-xs text-gray-500">{session?.user?.email || ''}</p>
                        </div>
                    </div>
                )}

                {/* Nav items */}
                <div className="flex flex-col gap-0.5 p-3 mt-2">
                    {navigationItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => { item.action(); setIsOpen(false); }}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 transition-all duration-150 ${navHoverColors[index]}`}
                        >
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800 ${iconColors[index]}`}>
                                <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                            </span>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Footer actions */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-3 space-y-1">
                    {canSwitchRole && (
                        <button
                            onClick={() => { handleRoleSwitch(currentRole === 'teacher' ? 'student' : 'teacher'); }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/10 hover:text-purple-300"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
                                <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
                            </span>
                            Switch to {currentRole === 'teacher' ? 'Student' : 'Teacher'}
                        </button>
                    )}
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
                            <FontAwesomeIcon icon={faSignOutAlt} className="h-3.5 w-3.5" />
                        </span>
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}
