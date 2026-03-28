import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { options } from '../[...nextauth]/options';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    
    const isTeacher = await db.collection('teachers').findOne({ email: session.user.email });
    if (!isTeacher) {
      return NextResponse.json({ error: 'Only teachers can import default questions' }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), 'default-questions.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(fileContent);

    // Validate all questions have correct answers in options
    for (const q of questions) {
      if (!q.answer || !q.ops || !q.ops.includes(q.answer)) {
        return NextResponse.json({ 
          error: `Invalid question: "${q.question}" - answer must be in options` 
        }, { status: 400 });
      }
    }

    // Create quiz from default questions
    const quiz = {
      title: 'General Knowledge Quiz (50 Questions)',
      questions,
      createdBy: session.user.email,
      createdAt: new Date(),
      isPublic: true
    };

    const result = await db.collection('quizzes').insertOne(quiz);

    return NextResponse.json({ 
      message: 'Default quiz imported successfully', 
      count: questions.length,
      quizId: result.insertedId
    });
  } catch (error) {
    console.error('Error importing default questions:', error);
    return NextResponse.json({ error: 'Failed to import questions' }, { status: 500 });
  }
}
