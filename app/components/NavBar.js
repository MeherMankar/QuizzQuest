'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBars, faTimes, faRankingStar, faGamepad, faChess, faUser, faInfoCircle, faSignOutAlt, faClipboardList } from '@fortawesome/free-solid-svg-icons';
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
        { label: 'Statistics', icon: faUser, action: () => router.push('/statistics') },
        { label: 'Auto Quiz', icon: faGamepad, action: () => router.push('/autoquiz') },
        { label: 'Chess', icon: faChess, action: () => router.push('/chess') },
        { label: 'Profile', icon: faUser, action: () => router.push('/profile') },
        { label: 'About Us', icon: faInfoCircle, action: () => router.push('/aboutus') }
    ];

    return (
        <>
            <header className="fixed top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <button
                            onClick={() => router.push('/')}
                            className="text-xl font-bold text-amber-400 transition-colors hover:text-amber-300"
                        >
                            QuizQuest
                        </button>

                        <nav className="hidden items-center gap-6 md:flex">
                            {navigationItems.slice(1, -1).map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    className="text-sm font-medium text-gray-400 transition-colors hover:text-gray-50"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <button onClick={() => ToggleMenu()} className="transition-opacity hover:opacity-80">
                            {userProfilePic ? (
                                <img
                                    src={userProfilePic}
                                    alt="profile"
                                    className="h-9 w-9 rounded-full ring-2 ring-amber-500"
                                />
                            ) : (
                                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
            )}

            <div className={`fixed right-0 top-0 z-50 h-full w-80 border-l border-gray-800 bg-gray-900 transition-transform duration-200 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-6">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="float-right rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-50"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                    
                    <div className="mt-16 space-y-2">
                        {navigationItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    item.action();
                                    setIsOpen(false);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-50"
                            >
                                <FontAwesomeIcon icon={item.icon} className="h-4 w-4 text-amber-500" />
                                <span>{item.label}</span>
                            </button>
                        ))}

                        <div className="my-4 border-t border-gray-800"></div>

                        {canSwitchRole && (
                            <button
                                onClick={() => {
                                    const newRole = currentRole === 'teacher' ? 'student' : 'teacher';
                                    handleRoleSwitch(newRole);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/10"
                            >
                                <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                                <span>Switch to {currentRole === 'teacher' ? 'Student' : 'Teacher'}</span>
                            </button>
                        )}

                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
