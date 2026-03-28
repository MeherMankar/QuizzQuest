'use client';
import React from 'react';
import "../global.css";
import NavBar from "../components/NavBar"

const founders = [
    {
        name: "Meher Gopal Mankar",
        email: "meherpatil84@gmail.com",
        phone: "+91 766683438",
        description: "An MCA student at Vidya Bharti Mahavidyalaya with a strong passion for technology and education.",
        image: "Doggy.jpg",
        linkedin: "https://linkedin.com/in/meher-mankar",
    },
    {
        name: "Pritam Ashok Borade",
        email: "pritamborade24@gmail.com",
        phone: "+91 7820905844",
        description: "An MCA student at Vidya Bharti Mahavidyalaya, dedicated to building innovative solutions for education.",
        image: "Chaitali.jpg",
        linkedin: "https://www.linkedin.com/in/pritam-borade-8b218b243 ",
    }
];

export default function AboutUs() {
    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent animate-fade-in">
                            About Us
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto animate-slide-up">
                            We are a team of Master of Computer Science students from Vidya Bharti Mahavidyalaya, 
                            dedicated to transforming education with interactive, engaging platforms. Our mission is to make learning accessible 
                            and enjoyable for everyone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {founders.map((founder, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative w-32 h-32">
                                        <img
                                            src={founder.image}
                                            alt={`${founder.name}'s profile`}
                                            className="w-full h-full rounded-full object-cover border-4 border-yellow-500 shadow-lg"
                                        />
                                    </div>

                                    <div className="text-center space-y-3">
                                        <a 
                                            href={founder.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                                        >
                                            {founder.name}
                                        </a>

                                        <p className="text-gray-300 leading-relaxed">
                                            {founder.description}
                                        </p>

                                        <div className="pt-4 space-y-2 text-sm">
                                            <p>
                                                <span className="text-gray-400">Email: </span>
                                                <a href={`mailto:${founder.email}`} className="text-yellow-400 hover:text-yellow-300">
                                                    {founder.email}
                                                </a>
                                            </p>
                                            <p>
                                                <span className="text-gray-400">Phone: </span>
                                                <a href={`tel:${founder.phone}`} className="text-yellow-400 hover:text-yellow-300">
                                                    {founder.phone}
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
