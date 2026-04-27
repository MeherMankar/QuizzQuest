'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NavBar from '../components/NavBar';

function TakeQuizContent() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get('id');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch('/api/auth/quizzes');
        const data = await response.json();
        if (response.ok) {
          const selectedQuiz = data.quizzes.find(q => q._id === quizId);
          setQuiz(selectedQuiz);
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/verify-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, answers })
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </>
    );
  }

  if (!quiz) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl text-white mb-4">Quiz not found</h2>
            <button onClick={() => router.push('/quizzes')} className="bg-amber-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-400">
              Back to Quizzes
            </button>
          </div>
        </div>
      </>
    );
  }

  if (result) {
    const percentage = ((result.score / quiz.questions.length) * 100).toFixed(1);
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-950 py-8 px-4">
          {/* Ambient background */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
            <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-green-600/5 blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/60 backdrop-blur-sm border border-white/5 p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-amber-400 mb-4 text-center">Quiz Results</h2>
              <div className={`text-6xl font-bold mb-4 text-center ${percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {percentage}%
              </div>
              <p className="text-gray-300 text-lg mb-6 text-center">
                You got {result.score} out of {quiz.questions.length} correct!
              </p>
              <div className="space-y-6 mt-8">
                {result.details.map((detail, index) => (
                  <div key={index} className={`p-6 rounded-lg border ${detail.correct ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                    <h3 className="text-xl font-semibold text-white mb-3">{index + 1}. {detail.question}</h3>
                    <p className="text-sm text-gray-400 mb-2">Your answer: <span className={detail.correct ? 'text-green-400' : 'text-red-400'}>{detail.userAnswer || 'Not answered'}</span></p>
                    <p className="text-sm text-gray-400">Correct answer: <span className="text-green-400">{detail.correctAnswer}</span></p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => router.push('/quizzes')} className="flex-1 bg-amber-500 text-black py-3 rounded-lg font-semibold hover:bg-amber-400">
                  Back to Quizzes
                </button>
                <button onClick={() => { setResult(null); setAnswers({}); }} className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-950 py-8 px-4">
        {/* Ambient background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-400 text-center mb-2">{quiz.title}</h1>
          <p className="text-gray-400 text-center mb-8">{quiz.questions.length} Questions</p>
          
          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div key={index} className="bg-gray-900/60 backdrop-blur-sm border border-white/5 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">{index + 1}. {question.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.ops.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => setAnswers(prev => ({ ...prev, [index]: option }))}
                      className={`p-4 rounded-lg text-left transition-all ${answers[index] === option ? 'bg-amber-500/20 border-2 border-amber-500 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-white/5'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-3 bg-amber-500 text-black rounded-lg font-semibold transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-400'}`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TakeQuizPage() {
  return (
    <Suspense fallback={
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </>
    }>
      <TakeQuizContent />
    </Suspense>
  );
}
