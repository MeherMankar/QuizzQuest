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
        image: "/Doggy.jpg",
        linkedin: "https://linkedin.com/in/meher-mankar",
        role: "Full Stack Developer",
        gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
        border: "border-amber-500/30 hover:border-amber-400/60",
        ring: "ring-amber-500",
        badge: "bg-amber-500/20 text-amber-300",
        orb: "bg-amber-500",
    },
    {
        name: "Pritam Ashok Borade",
        email: "pritamborade24@gmail.com",
        phone: "+91 7820905844",
        description: "An MCA student at Vidya Bharti Mahavidyalaya, dedicated to building innovative solutions for education.",
        image: "/pritam.jpeg",
        linkedin: "https://www.linkedin.com/in/pritam-borade-8b218b243",
        role: "UI/UX & Backend Developer",
        gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
        border: "border-purple-500/30 hover:border-purple-400/60",
        ring: "ring-purple-500",
        badge: "bg-purple-500/20 text-purple-300",
        orb: "bg-purple-500",
    }
];

const mission = [
    { icon: "🎯", label: "Mission-Driven" },
    { icon: "🚀", label: "Innovation First" },
    { icon: "📚", label: "Education Focused" },
    { icon: "🤝", label: "Team Spirit" },
];

export default function AboutUs() {
    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black text-white pt-8 pb-16 px-4 sm:px-8">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-14 space-y-4 animate-fade-in">
                        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300 mb-4">
                            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
                            MCA Project — Vidya Bharti Mahavidyalaya
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            Meet the Team
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed animate-slide-up">
                            We are Master of Computer Science students dedicated to transforming education
                            with interactive, engaging platforms. Our mission is to make learning
                            accessible and enjoyable for everyone.
                        </p>

                        {/* Mission pills */}
                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                            {mission.map((m) => (
                                <span key={m.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 backdrop-blur">
                                    <span>{m.icon}</span>
                                    {m.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Founder Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {founders.map((founder, index) => (
                            <div
                                key={index}
                                className={`relative overflow-hidden rounded-2xl border ${founder.border} bg-gradient-to-br ${founder.gradient} backdrop-blur-lg p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                {/* Decorative orb */}
                                <div className={`absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-20 ${founder.orb}`} />

                                <div className="relative flex flex-col items-center gap-5">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <img
                                            src={founder.image}
                                            alt={`${founder.name}'s profile`}
                                            className={`w-28 h-28 rounded-full object-cover ring-4 ${founder.ring} shadow-xl`}
                                        />
                                        <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-semibold ${founder.badge}`}>
                                            {founder.role}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="text-center space-y-2 mt-2 w-full">
                                        <a
                                            href={founder.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-2 text-xl font-bold text-white hover:text-amber-300 transition-colors"
                                        >
                                            {founder.name}
                                            <svg className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </a>

                                        <p className="text-gray-400 text-sm leading-relaxed">{founder.description}</p>

                                        {/* Contact */}
                                        <div className="pt-3 space-y-2 border-t border-white/10 text-sm">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-gray-500">📧</span>
                                                <a href={`mailto:${founder.email}`} className="text-gray-300 hover:text-amber-300 transition-colors truncate">
                                                    {founder.email}
                                                </a>
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-gray-500">📞</span>
                                                <a href={`tel:${founder.phone}`} className="text-gray-300 hover:text-amber-300 transition-colors">
                                                    {founder.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom tagline */}
                    <div className="mt-14 text-center">
                        <p className="text-gray-600 text-sm">
                            Built with ❤️ for the MCA programme · Vidya Bharti Mahavidyalaya · 2024–25
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
