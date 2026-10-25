import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { options } from '../[...nextauth]/options';

export async function POST(req) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const answers = body?.answers;

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers payload' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    const userEmail = session.user.email;

    let correctCount = 0;
    const results = {};
    const answerEntries = Object.entries(answers);
    const totalQuestions = answerEntries.length;

    for (const [questionId, selectedAnswer] of answerEntries) {
      if (typeof selectedAnswer !== 'string') {
        continue;
      }

      if (!ObjectId.isValid(questionId)) {
        console.log('Invalid questionId:', questionId);
        continue;
      }

      const objectId = new ObjectId(questionId);
      const question = await db.collection('user_credentials').findOne({ _id: objectId });

      if (!question) {
        console.log('Question not found:', questionId);
        continue;
      }

      const isCorrect = question.answer === selectedAnswer;
      if (isCorrect) correctCount += 1;
      results[questionId] = {
        isCorrect,
        correctAnswer: question.answer,
        userAnswer: selectedAnswer,
      };
    }

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    await db.collection('quiz_attempts').insertOne({
      userEmail,
      quizTitle: 'Teacher Quiz',
      category: 'General',
      score: scorePercentage,
      correctAnswers: correctCount,
      totalQuestions,
      completedAt: new Date(),
      timeTaken: 0,
    });

    return NextResponse.json({
      score: correctCount,
      results,
    });
  } catch (error) {
    console.error('Error verifying answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
