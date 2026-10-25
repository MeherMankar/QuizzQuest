"use client";

import NavBar from "./NavBar";
import "../global.css";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const FEATURES = [
  {
    number: '01',
    title: 'Build a quick quiz',
    body: 'Pick a topic and get a short round of multiple-choice practice.',
    link: 'Make an AI quiz',
    path: '/autoquiz',
  },
  {
    number: '02',
    title: 'Browse the library',
    body: 'Find questions already prepared for your next study session.',
    link: 'Explore quizzes',
    path: '/quizzes',
  },
  {
    number: '03',
    title: 'Take a different kind of break',
    body: 'Play a game of chess when it is time to step away from the notes.',
    link: 'Open chess',
    path: '/chess',
  },
];

function SampleQuestion() {
  return (
    <div className="relative mx-auto w-full max-w-md rotate-[1deg] rounded-2xl border border-[#d7d1c5] bg-white p-5 shadow-[0_24px_70px_rgba(39,48,41,0.14)] sm:p-7">
      <div className="mb-8 flex items-center justify-between border-b border-[#e9e5dc] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d8179]">A sample question</p>
          <p className="mt-1 text-sm font-semibold text-[#263b32]">Quick practice</p>
        </div>
        <span className="rounded-full bg-[#f5eee5] px-3 py-1.5 text-xs font-medium text-[#a24e32]">01 / 05</span>
      </div>

      <h2 className="mb-5 text-xl font-semibold leading-snug tracking-tight text-[#1d3027] sm:text-2xl">
        Which part of a plant cell stores most of its water?
      </h2>

      <div className="space-y-2.5">
        {[
          { letter: 'A', label: 'The nucleus', active: false },
          { letter: 'B', label: 'The central vacuole', active: true },
          { letter: 'C', label: 'The cell wall', active: false },
        ].map((option) => (
          <div
            key={option.letter}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm ${
              option.active
                ? 'border-[#49715d] bg-[#edf3ed] font-medium text-[#254431]'
                : 'border-[#e9e5dc] bg-[#fcfbf8] text-[#667069]'
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-semibold ${
              option.active ? 'bg-[#49715d] text-white' : 'bg-[#f0eee8] text-[#737971]'
            }`}>
              {option.letter}
            </span>
            {option.label}
            {option.active && <span className="ml-auto text-xs" aria-hidden="true">✓</span>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-[#8a8e85]">
        <span>One question at a time</span>
        <span className="font-medium text-[#49715d]">Keep going →</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      setRole(null);
      localStorage.removeItem("userProfilePic");
      localStorage.removeItem("userName");
      return;
    }

    const profilePic = session.user?.image;
    const userName = session.user?.name;
    if (profilePic) localStorage.setItem("userProfilePic", profilePic);
    if (userName) localStorage.setItem("userName", userName);

    fetch('/api/auth/user_roles')
      .then(response => {
        if (!response.ok) throw new Error('Unable to load account role.');
        return response.json();
      })
      .then(async data => {
        if (data.role === null) {
          const response = await fetch('/api/auth/user_roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'student' }),
          });
          if (!response.ok) throw new Error('Unable to set account role.');
          setRole('student');
        } else {
          setRole(data.role);
        }
      })
      .catch(error => {
        console.error('Error loading account role:', error);
        setRole(session.user?.role || null);
      })
      .finally(() => setLoading(false));
  }, [session]);

  const goToQuizzes = () => router.push('/quizzes');
  const goToAutoQuiz = () => router.push('/autoquiz');

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#1e3028]">
      <NavBar />

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <section className="grid items-center gap-12 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:pb-24">
          <div className="max-w-xl">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#69776c]">
              <span className="h-px w-8 bg-[#bf6544]" />
              QuizzQuest · Practice with purpose
            </p>

            <h1 className="font-serif text-5xl font-medium leading-[1.03] tracking-[-0.045em] text-[#20352b] sm:text-6xl lg:text-7xl">
              Make your next
              <br />
              study session
              <br />
              <span className="italic text-[#b95c3b]">count.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-[#657068] sm:text-lg">
              Turn what you are learning into a few good questions. Practice, see what you know, and keep moving.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {loading ? (
                <span className="text-sm text-[#748078]">Checking your account…</span>
              ) : !session ? (
                <>
                  <button
                    onClick={() => signIn()}
                    className="rounded-lg bg-[#294537] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e382a]"
                  >
                    Sign in to QuizzQuest
                  </button>
                  <button
                    onClick={goToAutoQuiz}
                    className="rounded-lg border border-[#c9c8bc] px-5 py-3 text-sm font-semibold text-[#30483a] transition-colors hover:border-[#718575] hover:bg-white/60"
                  >
                    Try a quick quiz
                  </button>
                </>
              ) : role === 'teacher' ? (
                <>
                  <button
                    onClick={() => router.push('/teacher/questions')}
                    className="rounded-lg bg-[#294537] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e382a]"
                  >
                    Open teacher tools
                  </button>
                  <button
                    onClick={goToQuizzes}
                    className="rounded-lg border border-[#c9c8bc] px-5 py-3 text-sm font-semibold text-[#30483a] transition-colors hover:border-[#718575] hover:bg-white/60"
                  >
                    Browse questions
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={goToQuizzes}
                    className="rounded-lg bg-[#294537] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e382a]"
                  >
                    Browse quizzes
                  </button>
                  <button
                    onClick={goToAutoQuiz}
                    className="rounded-lg border border-[#c9c8bc] px-5 py-3 text-sm font-semibold text-[#30483a] transition-colors hover:border-[#718575] hover:bg-white/60"
                  >
                    Make a quick quiz
                  </button>
                </>
              )}
            </div>

            {session && (
              <p className="mt-5 text-xs text-[#798078]">
                Welcome back{session.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}.
                {role && <span className="capitalize"> You are signed in as {role}.</span>}
              </p>
            )}
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-lg py-4 sm:py-8"
          >
            <div className="absolute inset-4 rotate-[-4deg] rounded-[1.75rem] border border-[#d8d2c6] bg-[#eae6dc]" />
            <div className="relative rounded-[1.75rem] border border-[#d8d2c6] bg-[#efebe2] p-5 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8179]">Practice, not cramming</p>
                  <p className="mt-1 text-sm text-[#46584c]">A little progress adds up.</p>
                </div>
                <span className="rounded-full border border-[#d4d2c7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64736a]">
                  Sample
                </span>
              </div>
              <SampleQuestion />
              <div className="mt-5 flex items-center gap-3 text-xs text-[#758077]">
                <span className="h-2 w-2 rounded-full bg-[#bf6544]" />
                Short rounds. Clear answers. Your own pace.
              </div>
            </div>
          </motion.div>
        </section>

        <section className="border-t border-[#dcd8ce] pt-9">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a15b40]">Find your next step</p>
              <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#20352b] sm:text-4xl">
                A few ways to get started.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#737b72]">
              Choose a tool that fits the way you want to learn today.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <motion.button
                key={feature.number}
                type="button"
                onClick={() => router.push(feature.path)}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.4,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                className="group min-h-52 rounded-xl border border-[#dedbd1] bg-[#fbfaf6] p-5 text-left transition-colors hover:border-[#adb9a9] hover:bg-white motion-reduce:transition-none sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-[#a15b40]">{feature.number}</span>
                  <span className="text-[#8a938a] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none" aria-hidden="true">↗</span>
                </div>
                <h3 className="mt-8 font-serif text-2xl font-medium tracking-tight text-[#263b30]">{feature.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[#727a72]">{feature.body}</p>
                <span className="mt-5 inline-block text-xs font-semibold text-[#42624e]">{feature.link}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="mt-10 flex flex-col justify-between gap-4 rounded-xl bg-[#e9e5da] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <p className="text-sm font-semibold text-[#2c4335]">Teaching with QuizzQuest?</p>
            <p className="mt-1 text-sm text-[#727a72]">Create and manage questions from your teacher workspace.</p>
          </div>
          <button
            onClick={() => router.push('/teacher/questions')}
            className="self-start rounded-lg border border-[#bdc3b8] px-4 py-2.5 text-sm font-semibold text-[#30483a] transition-colors hover:border-[#7a907e] hover:bg-white/60 sm:self-auto"
          >
            Teacher tools <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
    </div>
  );
}
