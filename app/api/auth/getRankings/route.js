import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('QuizApp_users');  // Replace with your database name
    const userScoresCollection = db.collection('user_scores');
    const teachersCollection = db.collection('teachers'); // Add the teachers collection

    // Aggregate scores by counting documents per user and exclude teachers
    const leaderboard = await userScoresCollection.aggregate([
      {
        // Lookup to find if userEmail exists in teachers collection
        $lookup: {
          from: "teachers",
          localField: "userEmail",
          foreignField: "email",      // Assuming 'email' field is used for teacher emails
          as: "teacherRecord"
        }
      },
      {
        // Filter out documents where teacherRecord array is not empty (i.e., user is a teacher)
        $match: { teacherRecord: { $size: 0 } }
      },
      {
        // Group by userEmail and calculate the score
        $group: {
          _id: "$userEmail",
          score: { $sum: 1 }         // Count the number of entries per user
        }
      },
      {
        // Format the output to show userEmail and score
        $project: {
          _id: 0,
          userEmail: "$_id",
          score: "$score"
        }
      },
      { 
        // Sort by score in descending order
        $sort: { score: -1 }
      }
    ]).toArray();

    // Return leaderboard as JSON response
    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    return NextResponse.json({ success: false, message: 'Failed to calculate leaderboard' }, { status: 500 });
  }
}
