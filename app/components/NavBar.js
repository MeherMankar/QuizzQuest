'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { signOut } from 'next-auth/react';

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [userProfilePic, setUserProfilePic] = useState(null);
    const router = useRouter();

    // Retrieve user profile picture and name from local storage
    useEffect(() => {
        setUserProfilePic(localStorage.getItem("userProfilePic"));
    }, []);

    const ToggleMenu = (open) => {
        setIsOpen(open !== undefined ? open : !isOpen);
    };

    const HandleHome = () => {
        router.push('/');
    };
    const HandleRankings = () => {
        router.push('/rankings');
    };
    const HandleAboutUs = () => {
        router.push('/aboutus');
    };
    const HandleProfile = () => {
        router.push('/profile');
    };
    const HandleAutoQuiz = () => {
        router.push('/autoquiz');
    };
    const HandleChess = () => {
        router.push('/chess');
    };

    return (
        <div>
            {/* Navbar container with reduced overall text size */}
            <div className="w-screen flex items-center sticky top-0 bg-calm-800 text-white text-lg z-10 p-3 shadow-md"> {/* Reduced padding and base text size */}
                <div className="flex-none">
                    <FontAwesomeIcon 
                        icon={faHome} 
                        onClick={HandleHome} 
                        className="hover:cursor-pointer text-xl text-white" 
                    />
                </div>
                

                {/* QuizQuest Title - increased font weight, adjusted size and margin */}
                <div className="flex-grow flex justify-center font-bold select-none text-xl sm:text-2xl ml-8"> {/* Adjusted margin to account for icon size + space */}
                    QuizQuest
                </div>

                {/* Right side: Profile Pic / Menu Icon */}
                <div className="flex-none flex items-center ml-auto"> {/* space-x-4 removed, relying on ml-auto */}
                    {userProfilePic ? (
                        <div className="relative">
                            <Image 
                                onClick={ToggleMenu} 
                                className="hover:cursor-pointer rounded-full border-2 border-calm-400" // Slightly toned down border
                                src={userProfilePic} 
                                alt="profile picture" 
                                width={32} // Slightly smaller profile pic
                                height={32} 
                            />
                        </div>
                    ) : (
                        null
                    )}
                    {/* Hamburger menu icon for sm+ screens if no profile pic, or always for xs screens */}
                    {!userProfilePic && (
                        <FontAwesomeIcon 
                            icon={isOpen ? faTimes : faBars}
                            onClick={() => ToggleMenu(isOpen ? false : true)}
                            className="hover:cursor-pointer text-xl text-white" 
                        />
                    )}
                </div>
            </div>

            {/* Sidebar Menu - increased width for potentially longer items, adjusted text size */}
            <div className={`flex flex-col fixed top-0 right-0 bg-calm-700 text-white w-60 h-screen gap-4 pt-20 px-4 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-500 ease-in-out z-40 mt-16`}>
                {/* Links for smaller screens (sm:hidden ensures they only show in sidebar on small screens) */}
                <div onClick={HandleRankings} className="p-2.5 hover:bg-calm-600 rounded-md hover:cursor-pointer text-base font-medium">
                    Rankings
                </div>
                <div onClick={HandleAutoQuiz} className="p-2.5 hover:bg-calm-600 rounded-md hover:cursor-pointer text-base font-medium">
                    Auto Quiz
                </div>
                <div onClick={HandleChess} className="p-2.5 hover:bg-calm-600 rounded-md hover:cursor-pointer text-base font-medium">
                    Chess
                </div>
                {/* Common sidebar links */}
                <div onClick={HandleProfile} className="p-2.5 hover:bg-calm-600 rounded-md hover:cursor-pointer text-base font-medium">
                    My Profile
                </div>
                <div onClick={HandleAboutUs} className="p-2.5 hover:bg-calm-600 rounded-md hover:cursor-pointer text-base font-medium">
                    About Us
                </div>
                <div className="p-2.5 hover:bg-calm-600 rounded-md hover:cursor-pointer text-base font-medium">
                    Settings
                </div>
                <div onClick={() => signOut()} className="p-2.5 hover:bg-calm-600 rounded-md hover:cursor-pointer text-base font-medium">
                    Sign Out
                </div>
            </div>
        </div>
    );
}
