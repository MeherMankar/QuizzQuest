import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { options } from '../[...nextauth]/options';

function isValidQuestionItem(question) {
  return question && typeof question.question === 'string' && Array.isArray(question.ops) && question.ops.length === 4 && typeof question.answer === 'string';
}

export async function POST(req) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    const userEmail = session.user.email;

    const isTeacher = await db.collection('teachers').findOne({ email: userEmail });
    if (!isTeacher) {
      return NextResponse.json({ error: 'Only teachers can add questions' }, { status: 403 });
    }

    const body = await req.json();
    const questions = Array.isArray(body?.questions) ? body.questions : [];

    if (!questions.length || !questions.every(isValidQuestionItem)) {
      return NextResponse.json({ error: 'Invalid question payload' }, { status: 400 });
    }

    const finalQuestions = questions.map(({ question, ops, answer }) => ({
      question,
      ops,
      answer,
      email: userEmail,
      createdAt: new Date(),
    }));

    const result = await db.collection('user_credentials').insertMany(finalQuestions);

    return NextResponse.json({ message: 'Questions added successfully', result });
  } catch (error) {
    console.error('Error inserting questions:', error);
    return NextResponse.json({ error: 'Failed to add questions' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    const isTeacher = await db.collection('teachers').findOne({ email: userEmail });
    const isStudent = await db.collection('students').findOne({ email: userEmail });

    let questions;

    if (isTeacher) {
      questions = await db.collection('user_credentials').find({ email: userEmail }).toArray();
    } else if (isStudent) {
      questions = await db.collection('user_credentials')
        .find({}, { projection: { answer: 0 } })
        .toArray();
    } else {
      return NextResponse.json({ error: 'User role not recognized' }, { status: 403 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching questions' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    const isTeacher = await db.collection('teachers').findOne({ email: userEmail });

    if (!isTeacher) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const result = await db.collection('user_credentials').deleteMany({ email: userEmail });

    return NextResponse.json({ message: 'Questions deleted successfully', result });
  } catch (error) {
    console.error('Error deleting questions:', error);
    return NextResponse.json({ error: 'Failed to delete questions' }, { status: 500 });
  }
}
