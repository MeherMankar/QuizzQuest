'use client';
import React from 'react';
import "../global.css";
import NavBar from "../components/NavBar"
const founders = [
  {
    name: "Prajakta Anna Wankhade ",
    // role: "Founder",
    email: "prajktawankhade22@gmail.com",
    phone: "+91 8180969350",
    description: "An MCA student at Prof. Ram Meghe Institute of Technology & Research with a strong passion for technology and education.",
    image: "Prajkta.jpg", // Replace with the actual path to the image
    linkedin: "https://www.linkedin.com/in/prajakta-wankhade-301665366", // LinkedIn profile URL
  },
  {
    name: "Chaitali Satish Bobade",
    // role: "Co-founder",
    email: "chaitalibobade3@gmail.com",
    phone: "+91 9209263975",
    description: "An MCA student at Prof. Ram Meghe Institute of Technology & Research, dedicated to building innovative solutions for education.",
    image: "Chaitali.jpg", // Replace with the actual path to the image
    linkedin: "https://www.linkedin.com/in/chaitali-bobade-533383339", // LinkedIn profile URL
  },
];

export default function AboutUs() {
  return (<>
    <NavBar/>
    <div className="min-h-screen bg-calm-100 text-gray-700 p-6 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-calm-900 mt-10 mb-4">About Us</h1>
      <p className="text-lg text-center max-w-2xl mb-10">
        We are a team of Master of Computer Science students from Prof. Ram Meghe Institute of Technology & Research Amravati, dedicated to transforming education with interactive, engaging platforms. Our mission is to make learning accessible and enjoyable for everyone.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl justify-center">
        {founders.map((founder, index) => (
          <div
            key={index}
            className="bg-calm-50 bg-opacity-80 rounded-lg p-6 text-center shadow-lg transform transition duration-300 hover:scale-105"
          >
            <div className="mb-4">
              <img
                src={founder.image}
                alt={`${founder.name}'s profile`}
                className="w-24 h-24 rounded-full mx-auto object-cover shadow-md"
              />
            </div>
            {/* LinkedIn clickable name */}
            <a 
              href={founder.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl font-semibold text-calm-700 mb-1 hover:text-calm-900"
            >
              {founder.name}
            </a>
            <p className="text-lg font-medium text-calm-600 mb-3">{founder.role}</p>
            <p className="text-gray-400 mb-4">{founder.description}</p>
            <div className="text-sm">
              <p className="mb-1">
                <span className="font-semibold text-calm-800">Email:</span> {founder.email}
              </p>
              <p>
                <span className="font-semibold text-calm-800">Phone:</span> {founder.phone}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
  );
}
