import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { options } from '../[...nextauth]/options';

export async function POST(req) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { quizId, answers } = await req.json();
    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    const { ObjectId } = require('mongodb');
    const quiz = await db.collection('quizzes').findOne({ _id: new ObjectId(quizId) });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    let score = 0;
    const details = quiz.questions.map((q, index) => {
      const userAnswer = answers[index];
      const correct = userAnswer === q.answer;
      if (correct) score++;
      
      return {
        question: q.question,
        userAnswer,
        correctAnswer: q.answer,
        correct
      };
    });

    // Record attempt
    await db.collection('quiz_attempts').insertOne({
      userId: session.user.email,
      quizId: new ObjectId(quizId),
      quizTitle: quiz.title,
      score,
      totalQuestions: quiz.questions.length,
      percentage: ((score / quiz.questions.length) * 100).toFixed(1),
      attemptedAt: new Date()
    });

    return NextResponse.json({ score, details });
  } catch (error) {
    console.error('Error verifying quiz:', error);
    return NextResponse.json({ error: 'Failed to verify quiz' }, { status: 500 });
  }
}
