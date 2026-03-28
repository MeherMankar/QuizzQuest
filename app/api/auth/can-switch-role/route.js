import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { options } from '../[...nextauth]/options';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    
    // Check if user has ever been promoted to teacher
    const isTeacher = await db.collection('teachers').findOne({ email: session.user.email });
    
    // Get current role
    const user = await db.collection('users').findOne({ email: session.user.email });
    const currentRole = user?.role || 'student';

    return NextResponse.json({ 
      canSwitch: !!isTeacher,
      currentRole,
      isTeacher: !!isTeacher
    });
  } catch (error) {
    console.error('Error checking role switch permission:', error);
    return NextResponse.json({ error: 'Failed to check permissions' }, { status: 500 });
  }
}
