'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBars, faTimes, faRankingStar, faGamepad, faChess, faUser, faInfoCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { signOut, useSession } from 'next-auth/react';

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();

    useEffect(() => {
        setUserProfilePic(localStorage.getItem("userProfilePic"));
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const ToggleMenu = (open) => {
        setIsOpen(open !== undefined ? open : !isOpen);
    };

    const handleRoleSwitch = async (role) => {
        try {
            const response = await fetch('/api/auth/user_roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role }),
            });

            if (response.ok) {
                // Update the session with the new role
                await updateSession({
                    ...session,
                    user: {
                        ...session.user,
                        role: role
                    }
                });

                setIsOpen(false);
                router.refresh(); // Refresh the current page to update navigation items
                
                // Optional: Show success message
                alert(`Successfully switched to ${role} role`);
            } else {
                console.error('Failed to switch role');
                alert('Failed to switch role. Please try again.');
            }
        } catch (error) {
            console.error('Error switching role:', error);
            alert('Error switching role. Please try again.');
        }
    };

    const navigationItems = [
        { label: 'Home', icon: faHome, action: () => router.push('/') },
        { label: 'Rankings', icon: faRankingStar, action: () => router.push('/rankings') },
        { label: 'Auto Quiz', icon: faGamepad, action: () => router.push('/autoquiz') },
        { label: 'Chess', icon: faChess, action: () => router.push('/chess') },
        { label: 'Profile', icon: faUser, action: () => router.push('/profile') },
        { label: 'About Us', icon: faInfoCircle, action: () => router.push('/aboutus') }
    ];

    return (
        <>
            <header className="fixed w-full top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center space-x-3 group"
                        >
                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                QuizQuest
                            </span>
                        </button>

                        <div className="hidden md:flex items-center space-x-8">
                            {navigationItems.slice(1, -1).map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    className="text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center">
                            {userProfilePic ? (
                                <button onClick={() => ToggleMenu()} className="group">
                                    <img
                                        src={userProfilePic}
                                        alt="profile"
                                        className="w-10 h-10 rounded-full ring-2 ring-yellow-400 group-hover:ring-yellow-300 transition-all"
                                    />
                                </button>
                            ) : (
                                <button
                                    onClick={() => ToggleMenu()}
                                    className="text-gray-400 hover:text-white p-3 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-xl" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
            )}

            <div className={`fixed top-0 right-0 h-full w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-6">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="float-right text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                    
                    <div className="mt-12 space-y-3">
                        {navigationItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    item.action();
                                    setIsOpen(false);
                                }}
                                className="flex items-center space-x-4 w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
                            >
                                <FontAwesomeIcon icon={item.icon} className="w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}

                        <div className="border-t border-white/10 my-6"></div>

                        <button
                            onClick={() => {
                                const newRole = session?.user?.role === 'teacher' ? 'student' : 'teacher';
                                handleRoleSwitch(newRole);
                            }}
                            className="flex items-center space-x-4 w-full text-left px-4 py-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition-all duration-200 group"
                        >
                            <FontAwesomeIcon icon={faUser} className="w-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">
                                Switch to {session?.user?.role === 'teacher' ? 'Student' : 'Teacher'}
                            </span>
                        </button>

                        <button
                            onClick={() => signOut()}
                            className="flex items-center space-x-4 w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-16"></div>
        </>
    );
}
