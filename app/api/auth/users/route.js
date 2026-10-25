import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { isValidAdminCredentials, getAdminSessionFromRequest } from '../admin/login/route';

async function isAuthorizedAdmin(req) {
  const sessionUser = getAdminSessionFromRequest(req);
  if (sessionUser) return sessionUser;

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const isValid = await isValidAdminCredentials(username, password);
  if (!isValid) return null;

  return username;
}

export async function GET(req) {
  try {
    const adminUser = await isAuthorizedAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    const usersFromCollection = await db.collection('users').find({}, {
      projection: { email: 1, name: 1, role: 1, _id: 1 },
    }).toArray();

    const teachers = await db.collection('teachers').find({}, {
      projection: { email: 1 },
    }).toArray();

    const students = await db.collection('students').find({}, {
      projection: { email: 1 },
    }).toArray();

    const userMap = new Map();
    const teacherEmailSet = new Set(teachers.map((t) => t.email));

    usersFromCollection.forEach((user) => {
      userMap.set(user.email, {
        _id: user._id,
        email: user.email,
        name: user.name || 'N/A',
        role: user.role || 'student',
        isTeacher: teacherEmailSet.has(user.email),
      });
    });

    teachers.forEach((teacher) => {
      if (!userMap.has(teacher.email)) {
        userMap.set(teacher.email, {
          _id: teacher._id,
          email: teacher.email,
          name: 'N/A',
          role: 'teacher',
          isTeacher: true,
        });
      }
    });

    students.forEach((student) => {
      if (!userMap.has(student.email)) {
        userMap.set(student.email, {
          _id: student._id,
          email: student.email,
          name: 'N/A',
          role: 'student',
          isTeacher: false,
        });
      }
    });

    return NextResponse.json({ users: Array.from(userMap.values()) });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const adminUser = await isAuthorizedAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const role = body?.role;

    if (!email || (role !== 'teacher' && role !== 'student')) {
      return NextResponse.json({ error: 'Invalid role update payload' }, { status: 400 });
    }

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
