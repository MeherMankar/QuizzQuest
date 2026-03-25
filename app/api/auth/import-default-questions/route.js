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

    const finalQuestions = questions.map(({ question, ops, answer }) => ({
      question,
      ops,
      answer,
      email: session.user.email,
      createdAt: new Date()
    }));

    const result = await db.collection('user_credentials').insertMany(finalQuestions);

    return NextResponse.json({ 
      message: 'Default questions imported successfully', 
      count: result.insertedCount 
    });
  } catch (error) {
    console.error('Error importing default questions:', error);
    return NextResponse.json({ error: 'Failed to import questions' }, { status: 500 });
  }
}
