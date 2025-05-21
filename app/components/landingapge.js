"use client";
import NavBar from "./NavBar";
import "../global.css";
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

export default function Component() {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSignup = () => {
    router.push('/signuppage');
  };

  // Handle navigation to different pages
  const handleCreateQuestion = () => {
    router.push('/teacher/questions');
  };
  const handleViewQuestions = () => {
    router.push('/viewquestions');
  };
  const handleSolveQuestions = () => {
    router.push('/viewquestions');
  };

  useEffect(() => {
    if (session) {
      // Save the user's profile picture and name to localStorage
      const profilePic = session.user?.image; // Adjust based on session data structure
      const userName = session.user?.name;

      if (profilePic) {
        localStorage.setItem("userProfilePic", profilePic);
      }
      if (userName) {
        localStorage.setItem("userName", userName);
      }

      // Fetch user role
      const fetchRole = async () => {
        try {
          const response = await fetch('/api/auth/user_roles', {
            method: 'GET',
          });
          const data = await response.json();
          if (response.ok) {
            setRole(data.role);
          } else {
            console.error(data.error);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRole();
    } else {
      setLoading(false);
      localStorage.removeItem("userProfilePic"); 
    localStorage.removeItem("userName");
    }
  }, [session]);

  return (
    <>  
      <div className="min-h-screen flex flex-col bg-joyful-100 text-gray-700 mainbg">
        <NavBar />
        
        <div className="backdrop-blur-md top-[0px] pt-6 sm:pt-10 flex flex-col space-y-4 sm:space-y-6 items-center justify-center w-full min-h-[calc(100vh-var(--navbar-height,60px))] rounded-xl text-center px-4"> {/* Adjusted height, assuming navbar height variable or default */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5rem] text-calm-900 font-bold leading-tight">Welcome to QuizQuest!</h1> {/* Light text, adjusted size slightly, leading-tight */}
          
          <h2 className="text-lg sm:text-xl font-medium text-calm-700 max-w-2xl"> {/* Light text, font-medium, max-width for readability */}
            QuizQuest is an online platform to solve quizzes in a fun and interactive way.
          </h2>
          
          <h2 className="text-lg sm:text-xl font-medium text-calm-700 max-w-2xl">
            We offer a platform for teachers and students to engage in a healthy competitive environment.
          </h2>
          
          <h2 className="text-lg sm:text-xl font-medium text-calm-700 max-w-2xl">
            Our aim is to make quizzes more enjoyable, encouraging students to discover answers by playing a variety of games.
          </h2>

          {/* Consistent Button Styling: py-2.5 px-6 rounded-lg font-semibold transition duration-200 */}
          {!session ? (
            <button
              onClick={() => signIn()}
              className="bg-creative-500 text-white py-2.5 px-8 rounded-lg font-semibold hover:bg-creative-400 transition duration-200 shadow-md" // Primary button
            >
              Login
            </button>
          ) : (
            <>

              {!loading && role === null && (
                <button
                  onClick={handleSignup}
                  className="bg-creative-500 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-creative-400 transition duration-200 shadow-md" // Primary button
                >
                  Select Role
                </button>
              )}

              {/* Render Teacher-specific buttons */}
              {role === 'teacher' && (
                <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 items-center">
                  <button
                    onClick={handleCreateQuestion}
                    className="bg-creative-700 text-white hover:bg-creative-600 py-2.5 px-6 rounded-lg font-semibold transition duration-200 shadow-md w-full sm:w-auto" // Secondary
                  >
                    Create Questions
                  </button>
                  <button
                    onClick={handleViewQuestions}
                    className="bg-creative-700 text-white hover:bg-creative-600 py-2.5 px-6 rounded-lg font-semibold transition duration-200 shadow-md w-full sm:w-auto" // Secondary
                  >
                    View Questions
                  </button>
                </div>
              )}

              {/* Render Student-specific button */}
              {role === 'student' && (
                <div className="mt-4 w-full px-4 sm:px-0 sm:max-w-xs">
                  <button
                    onClick={handleSolveQuestions}
                    className="bg-creative-500 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-creative-400 transition duration-200 shadow-md w-full" // Primary
                  >
                    Solve Questions
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
