import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { hash } from 'bcryptjs';

const ADMIN_PASSWORD_HASH = '$2a$10$YourHashedPasswordHere'; // Will be generated

async function verifyAdmin(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (username !== adminUsername) return false;
  
  // For now, use plain text comparison (will hash in production)
  // TODO: Replace with: return await compare(password, ADMIN_PASSWORD_HASH);
  return password === adminPassword;
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const isValid = await verifyAdmin(username, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const isValid = await verifyAdmin(username, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
