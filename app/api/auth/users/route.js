import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb'; // Adjust the path based on your directory structure

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    const users = await db.collection('user_credentials').find({}).toArray();
   
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
