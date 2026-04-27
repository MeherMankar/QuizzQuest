'use client';
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBars, faTimes, faGamepad, faChess, faUser, faInfoCircle, faSignOutAlt, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { signOut, useSession } from 'next-auth/react';

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [canSwitchRole, setCanSwitchRole] = useState(false);
    const [currentRole, setCurrentRole] = useState('student');
    const [scrolled, setScrolled] = useState(false);
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setUserProfilePic(localStorage.getItem("userProfilePic"));
        
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });

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
        
        if (session?.user) checkRolePermission();
        return () => window.removeEventListener('scroll', onScroll);
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
        { label: 'Home',      icon: faHome,          path: '/',          action: () => router.push('/') },
        { label: 'Quizzes',   icon: faClipboardList, path: '/quizzes',   action: () => router.push('/quizzes') },
        { label: 'Auto Quiz', icon: faGamepad,       path: '/autoquiz',  action: () => router.push('/autoquiz') },
        { label: 'Chess',     icon: faChess,         path: '/chess',     action: () => router.push('/chess') },
        { label: 'Profile',   icon: faUser,          path: '/profile',   action: () => router.push('/profile') },
        { label: 'About Us',  icon: faInfoCircle,    path: '/aboutus',   action: () => router.push('/aboutus') },
    ];

    // Color map for nav items
    const iconColors = [
        'text-amber-400',    // Home
        'text-blue-400',     // Quizzes
        'text-purple-400',   // Auto Quiz
        'text-green-400',    // Chess
        'text-pink-400',     // Profile
        'text-orange-400',   // About Us
    ];

    const navHoverColors = [
        'hover:text-amber-300 hover:bg-amber-500/10',
        'hover:text-blue-300 hover:bg-blue-500/10',
        'hover:text-purple-300 hover:bg-purple-500/10',
        'hover:text-green-300 hover:bg-green-500/10',
        'hover:text-pink-300 hover:bg-pink-500/10',
        'hover:text-orange-300 hover:bg-orange-500/10',
    ];

    return (
        <>
            {/* Header */}
            <header className={`fixed top-0 z-40 w-full transition-all duration-300 ${
                scrolled
                  ? 'border-b border-white/8 bg-[#050508]/95 shadow-[0_1px_40px_rgba(0,0,0,0.6)]'
                  : 'border-b border-white/5 bg-[#050508]/80'
            }`} style={{backdropFilter:'blur(28px) saturate(200%)'}}>
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <button
                            onClick={() => router.push('/')}
                            className="group flex items-center gap-2"
                        >
                            {/* Animated glowing dot */}
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                            </span>
                            <span
                                className="text-xl font-black tracking-tight animate-gradient bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, #fbbf24, #f97316, #fb7185, #a855f7, #fbbf24)',
                                    backgroundSize: '300% 300%',
                                    animation: 'gradShift 6s ease infinite',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                QuizzQuest
                            </span>
                        </button>

                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-0.5 md:flex">
                            {navigationItems.slice(1, -1).map((item, index) => {
                                const isActive = pathname === item.path;
                                return (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                          ? 'text-white '
                                          : `text-gray-500 ${navHoverColors[index + 1]}`
                                    }`}
                                >
                                    {isActive && (
                                        <span className="absolute inset-0 rounded-lg bg-white/5 border border-white/10" />
                                    )}
                                    <FontAwesomeIcon icon={item.icon} className={`h-3.5 w-3.5 ${iconColors[index + 1]}`} />
                                    <span className="relative">{item.label}</span>
                                </button>
                                );
                            })}
                        </nav>

                        {/* Profile / hamburger */}
                        <button
                            onClick={() => ToggleMenu()}
                            className="flex items-center gap-2 rounded-xl p-1.5 transition-all hover:bg-white/5"
                        >
                            {userProfilePic ? (
                                <div className="relative">
                                    <img
                                        src={userProfilePic}
                                        alt="profile"
                                        className="h-8 w-8 rounded-full ring-2 ring-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                                    />
                                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#050508]" />
                                </div>
                            ) : null}
                            <div className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                                isOpen ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-gray-400 hover:text-gray-200'
                            }`}>
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
            <div className={`fixed right-0 top-0 z-50 h-full w-72 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`} style={{
                background: 'linear-gradient(160deg, #0d0d14 0%, #08080f 100%)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
            }}>
                {/* Ambient orb inside drawer */}
                <div className="absolute top-0 right-0 h-48 w-48 rounded-full opacity-30 pointer-events-none"
                    style={{background:'radial-gradient(circle, rgba(245,158,11,0.2), transparent 70%)', filter:'blur(40px)'}} />

                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4"
                    style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                    <span className="text-base font-black tracking-tight"
                        style={{
                            backgroundImage:'linear-gradient(135deg,#fbbf24,#f97316,#fb7185)',
                            WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent'
                        }}>
                        QuizzQuest
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-white/8 hover:text-gray-200 hover:scale-110"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                </div>

                {/* User info */}
                {userProfilePic && (
                    <div className="flex items-center gap-3 px-5 py-3.5" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                        <div className="relative">
                            <img src={userProfilePic} alt="profile"
                                className="h-10 w-10 rounded-full"
                                style={{boxShadow:'0 0 0 2px rgba(245,158,11,0.5), 0 0 16px rgba(245,158,11,0.25)'}}
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#0d0d14]" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-100">{session?.user?.name || 'User'}</p>
                            <p className="truncate text-xs text-gray-600">{session?.user?.email || ''}</p>
                        </div>
                    </div>
                )}

                {/* Nav items */}
                <div className="flex flex-col gap-0.5 p-3 mt-2">
                    {navigationItems.map((item, index) => {
                        const isActive = pathname === item.path;
                        return (
                        <button
                            key={index}
                            onClick={() => { item.action(); setIsOpen(false); }}
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                                isActive
                                  ? 'text-white bg-white/6'
                                  : `text-gray-400 ${navHoverColors[index]}`
                            }`}
                        >
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                                isActive ? `${iconColors[index]} bg-white/8` : `bg-[#111118] ${iconColors[index]}`
                            }`}
                                style={isActive ? {boxShadow:`0 0 12px currentColor`} : {}}>
                                <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                            </span>
                            {item.label}
                            {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />}
                        </button>
                        );
                    })}
                </div>

                {/* Footer actions */}
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                    {canSwitchRole && (
                        <button
                            onClick={() => { handleRoleSwitch(currentRole === 'teacher' ? 'student' : 'teacher'); }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/10 hover:text-purple-300"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                                <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
                            </span>
                            Switch to {currentRole === 'teacher' ? 'Student' : 'Teacher'}
                        </button>
                    )}
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                        style={{
                            background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))',
                            color:'rgba(252,165,165,1)',
                            border:'1px solid rgba(239,68,68,0.15)'
                        }}
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
