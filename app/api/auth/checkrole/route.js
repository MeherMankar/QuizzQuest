import clientPromise from '../../../../lib/mongodb';
import { getServerSession } from "next-auth";
import options from '../[...nextauth]/options';

export default async function handler(req, res) {
  // Ensure this endpoint only accepts GET requests
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(options);

      if (!session || !session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userEmail = session.user.email;

      const client = await clientPromise;
      
      const db = client.db('QuizApp_users');

      // Check if the user is a teacher
      const isTeacher = await db.collection('teachers').findOne({ email: userEmail });
      if (isTeacher) {
        return res.status(200).json({ role: 'teacher' });
      }

      // Check if the user is a student
      const isStudent = await db.collection('students').findOne({ email: userEmail });
      if (isStudent) {
        return res.status(200).json({ role: 'student' });
      }

      // User role not found
      return res.status(200).json({ role: 'none' });

    } catch (error) {
      console.error('Error checking user role:', error);
      return res.status(500).json({ error: 'Failed to check user role' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
