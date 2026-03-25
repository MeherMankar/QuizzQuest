import { NextResponse } from 'next/server';
import  clientPromise  from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import {options} from '../[...nextauth]/options'
export async function POST(req) {
  try {
    const session  = await getServerSession(options);
    if(!session || !session.user){
      return NextResponse.json({error:'Not authenticated'},{status:401})
    }
    const userEmail = session.user.email
    const body = await req.json();
    const { email, questionId, isCorrect } = body;

    // Connect to MongoDB and select the database
    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    const userScoresCollection = db.collection('user_scores'); // Use the desired collection
    console.log(body)
    // Insert document into the `user_scores` collection
    const result = await userScoresCollection.insertOne({
      userEmail,
      questionId,
      isCorrect,
      timestamp: new Date(),
    });

    // Return success response
    return NextResponse.json({ success: true, message: 'Answer recorded successfully', result });
  } catch (error) {
    console.error('Error recording answer:', error.message, error.stack);

    // Return error response
    return NextResponse.json({ success: false, message: 'Failed to record answer' }, { status: 500 });
  }
}
