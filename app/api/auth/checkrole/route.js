import clientPromise from '../../../../lib/mongodb';
import { getServerSession } from "next-auth";
import { options } from '../[...nextauth]/options';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;

    const client = await clientPromise;
    
    const db = client.db('QuizApp_users');

    // Check if the user is a teacher
    const teacher = await db.collection('teachers').findOne({ email: userEmail });
    if (teacher) {
      return NextResponse.json({ role: 'teacher' }, { status: 200 });
    }

    // Check if the user is a student
    const student = await db.collection('students').findOne({ email: userEmail });
    if (student) {
      return NextResponse.json({ role: 'student' }, { status: 200 });
    }

    // User role not found
    return NextResponse.json({ role: 'none' }, { status: 200 });

  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.json({ error: 'Failed to check user role' }, { status: 500 });
  }
}
