import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb'; 
import { getServerSession } from 'next-auth';
import {options} from '../[...nextauth]/options'


export async function POST(req) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    const questionsCollection = db.collection('user_credentials');
    const userEmail = session.user.email;

    const body = await req.json();
    console.log(body);
    const { questions } = body;
    console.log(questions);

    // Format all questions to include email and createdAt fields
    const finalQuestions = questions.map(({ question, ops, answer }) => ({
      question,
      ops,
      answer,
      email: userEmail,
      createdAt: new Date()
    }));

    // Insert all questions at once
    const result = await questionsCollection.insertMany(finalQuestions);

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
    
    // Check if the user is a teacher
    const isTeacher = await db.collection('teachers').findOne({ email: userEmail });
    // Check if the user is a student
    const isStudent = await db.collection('students').findOne({ email: userEmail });
    
    let questions;

    if (isTeacher) {
      // If the user is a teacher, return all questions (or any specific logic you want for teachers)
      questions = await db.collection('user_credentials').find({ email: userEmail }).toArray();
    } else if (isStudent) {
      // If the user is a student, return questions filtered by email and exclude the answer
      questions = await db.collection('user_credentials')
        .find({ email: userEmail })
        .project({ answer: 0 }) // Exclude the answer field
        .toArray();
    } else {
      return NextResponse.json({ error: 'User role not recognized' }, { status: 403 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error); // Log the error for debugging
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

        // Check if the user is a teacher
        const isTeacher = await db.collection('teachers').findOne({ email: userEmail });

        if (!isTeacher) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Delete all questions associated with the teacher's email
        const result = await db.collection('user_credentials').deleteMany({ email: userEmail });

        return NextResponse.json({ message: 'Questions deleted successfully', result });
    } catch (error) {
        console.error('Error deleting questions:', error);
        return NextResponse.json({ error: 'Failed to delete questions' }, { status: 500 });
    }
}
