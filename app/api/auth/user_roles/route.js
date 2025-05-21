import clientPromise from '../../../../lib/mongodb'; 
import { getServerSession } from "next-auth";
import options from '../[...nextauth]/options';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // Get session info for authentication
        const session = await getServerSession(options);
        
        // Check if the user is authenticated
        if (!session || !session.user) { 
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Parse the request body to get the role
        const { role } = await req.json(); // Use `await req.json()` to properly parse the JSON body
        const userEmail = session.user.email;

        // Log the role to check if it's being received correctly
        console.log('Role:', role);

        // Connect to the MongoDB client
        const client = await clientPromise;
        const db = client.db('QuizApp_users');

        // Insert the email into the appropriate collection based on the role
        if (role === 'teacher') {
            // Check if the teacher already exists in the collection
            const existingTeacher = await db.collection('teachers').findOne({ email: userEmail });
            if (!existingTeacher) {
                await db.collection('teachers').insertOne({ email: userEmail });
            }
        } else if (role === 'student') {
            // Check if the student already exists in the collection
            const existingStudent = await db.collection('students').findOne({ email: userEmail });
            if (!existingStudent) {
                await db.collection('students').insertOne({ email: userEmail });
            }
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Return a success response
        return NextResponse.json({ message: 'User role stored successfully' });

    } catch (error) {
        console.error('Error storing user role:', error);
        return NextResponse.json({ error: 'Failed to store user role' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Get session info for authentication
        const session = await getServerSession(options);
        if (!session || !session.user) { 
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        const userEmail = session.user.email;
        const client = await clientPromise;
        const db = client.db('QuizApp_users');
        
        // Check if user is a teacher
        const teacher = await db.collection('teachers').findOne({ email: userEmail });
        if (teacher) {
            return NextResponse.json({ role: 'teacher' });
        }

        // Check if user is a student
        const student = await db.collection('students').findOne({ email: userEmail });
        if (student) {
            return NextResponse.json({ role: 'student' });
        }

        // No role found
        return NextResponse.json({ role: null });
    } catch (error) {
        console.error('Failed to fetch user role:', error);
        return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
    }
}