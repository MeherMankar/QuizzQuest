'use client';
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBars, faTimes, faGamepad, faChess, faUser, faInfoCircle, faSignOutAlt, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { signOut, useSession } from 'next-auth/react';

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [userProfilePic, setUserProfilePic] = useState(null);
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

    return (
        <>
            {/* Header */}
            <header className={`fixed top-0 z-40 w-full transition-all duration-300 ${
                scrolled
                  ? 'border-b border-[#d9d7ce] bg-[#f5f2ea]/95 shadow-[0_4px_18px_rgba(35,48,39,0.06)]'
                  : 'border-b border-[#dedbd1] bg-[#f5f2ea]/90'
            }`} style={{backdropFilter:'blur(18px)'}}>
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="flex h-[4.25rem] items-center justify-between">
                        {/* Logo */}
                        <button
                            onClick={() => router.push('/')}
                            className="group flex items-center gap-2.5"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#294537] font-serif text-lg font-bold text-[#f5f2ea] transition-transform group-hover:-rotate-3">
                                Q
                            </span>
                            <span className="text-lg font-semibold tracking-[-0.04em] text-[#24372c]">
                                QuizzQuest
                            </span>
                        </button>

                        {/* Desktop nav */}
                        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
                            {navigationItems.slice(1).map((item, index) => {
                                const isActive = pathname === item.path;
                                return (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 ${
                                        isActive
                                          ? 'bg-[#e8ece4] text-[#294537]'
                                          : 'text-[#69746b] hover:bg-[#ebe9df] hover:text-[#294537]'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 opacity-75" />
                                    <span>{item.label}</span>
                                </button>
                                );
                            })}
                        </nav>

                        {/* Profile / hamburger */}
                        <div className="flex items-center gap-3">
                            {!session ? (
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    className="hidden rounded-lg bg-[#294537] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1e382a] sm:inline-flex"
                                >
                                    Sign in
                                </button>
                            ) : (
                                <div className="hidden items-center gap-2 rounded-full border border-[#d9d7ce] bg-[#fbfaf6] px-2.5 py-1.5 sm:flex">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#67836a]" />
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#526b56]">
                                        {currentRole || 'student'}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={() => ToggleMenu()}
                                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isOpen}
                                className="flex items-center gap-2 rounded-lg p-1.5 text-[#526157] transition-colors hover:bg-[#e9e6dc] hover:text-[#294537]"
                            >
                                {userProfilePic ? (
                                    <div className="relative">
                                        <img
                                            src={userProfilePic}
                                            alt="Profile"
                                            className="h-8 w-8 rounded-full ring-2 ring-[#d0d8cc]"
                                        />
                                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#66846a] ring-2 ring-[#f5f2ea]" />
                                    </div>
                                ) : null}
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                    isOpen ? 'bg-[#e8ece4] text-[#294537]' : ''
                                }`}>
                                    <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-4 w-4" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#20352b]/25 backdrop-blur-[2px]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div className={`fixed right-0 top-0 z-50 h-full w-80 max-w-[88vw] overflow-hidden border-l border-[#dedbd1] bg-[#f8f6ef] shadow-[-16px_0_50px_rgba(35,48,39,0.12)] transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`} aria-hidden={!isOpen}>

                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-[#e2dfd5] px-5 py-4">
                    <span className="text-base font-semibold tracking-tight text-[#294537]">
                        QuizzQuest
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#69746b] transition-colors hover:bg-[#ebe9df] hover:text-[#294537]"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                </div>

                {/* User info */}
                {userProfilePic && (
                    <div className="flex items-center gap-3 border-b border-[#e2dfd5] px-5 py-4">
                        <div className="relative">
                            <img src={userProfilePic} alt="profile"
                                className="h-10 w-10 rounded-full ring-2 ring-[#d0d8cc]"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#66846a] ring-2 ring-[#f8f6ef]" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#2c4034]">{session?.user?.name || 'User'}</p>
                            <p className="truncate text-xs text-[#7c8279]">{session?.user?.email || ''}</p>
                        </div>
                    </div>
                )}

                {/* Nav items */}
                <nav aria-label="Mobile navigation" className="mt-2 flex flex-col gap-1 p-3">
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                        <button
                            key={item.path}
                            onClick={() => { item.action(); setIsOpen(false); }}
                            aria-current={isActive ? 'page' : undefined}
                            className={`group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                                isActive
                                  ? 'bg-[#e8ece4] text-[#294537]'
                                  : 'text-[#68736a] hover:bg-[#eeece3] hover:text-[#294537]'
                            }`}
                        >
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                isActive ? 'bg-white text-[#496c55]' : 'bg-[#eeece3] text-[#758176]'
                            }`}>
                                <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                            </span>
                            {item.label}
                            {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#bf6544]" />}
                        </button>
                        );
                    })}
                </nav>

                {/* Footer actions */}
                <div className="absolute bottom-0 left-0 right-0 space-y-1 border-t border-[#e2dfd5] bg-[#f8f6ef] p-3">
                    {canSwitchRole && (
                        <button
                            onClick={() => { handleRoleSwitch(currentRole === 'teacher' ? 'student' : 'teacher'); }}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#526b56] transition-colors hover:bg-[#e8ece4]"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8ece4]">
                                <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
                            </span>
                            Switch to {currentRole === 'teacher' ? 'Student' : 'Teacher'}
                        </button>
                    )}
                    <button
                        onClick={() => signOut()}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#9a5344] transition-colors hover:bg-[#f5e9e3]"
                    >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5e9e3]">
                            <FontAwesomeIcon icon={faSignOutAlt} className="h-3.5 w-3.5" />
                        </span>
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}
