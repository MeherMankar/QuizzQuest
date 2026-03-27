import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (authHeader) {
      const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      if (username !== adminUsername || password !== adminPassword) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    const users = await db.collection('users').find({}, { 
      projection: { email: 1, name: 1, role: 1, _id: 1 } 
    }).toArray();
   
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await req.json();

    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    await db.collection('users').updateOne(
      { email },
      { $set: { role } },
      { upsert: true }
    );

    await db.collection('teachers').deleteOne({ email });
    await db.collection('students').deleteOne({ email });

    if (role === 'teacher') {
      await db.collection('teachers').insertOne({ email, createdAt: new Date() });
    } else if (role === 'student') {
      await db.collection('students').insertOne({ email, createdAt: new Date() });
    }

    return NextResponse.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Failed to update role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
