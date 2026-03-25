import clientPromise from '../../../../lib/mongodb'; 
import { getServerSession } from "next-auth";
import { options } from '../[...nextauth]/options';
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

        console.log('Switching role for', userEmail, 'to', role);

        // Connect to the MongoDB client
        const client = await clientPromise;
        const db = client.db('QuizApp_users');

        // Update the user's role in the main users collection
        await db.collection('users').updateOne(
            { email: userEmail },
            { $set: { role: role } },
            { upsert: true }
        );

        // First, remove the user from both collections to avoid duplicates
        await db.collection('teachers').deleteOne({ email: userEmail });
        await db.collection('students').deleteOne({ email: userEmail });

        // Then add to the appropriate collection
        if (role === 'teacher') {
            await db.collection('teachers').insertOne({
                email: userEmail,
                createdAt: new Date()
            });
            return NextResponse.json({ message: 'Role switched to teacher successfully', role: 'teacher' });
        } else if (role === 'student') {
            await db.collection('students').insertOne({
                email: userEmail,
                createdAt: new Date()
            });
            return NextResponse.json({ message: 'Role switched to student successfully', role: 'student' });
        } else {
            return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error storing user role:', error);
        return NextResponse.json({ 
            error: 'Failed to store user role',
            details: error.message
        }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        // Get session info for authentication
        const session = await getServerSession(options);
        if (!session || !session.user) { 
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        const userEmail = session.user.email;
        const client = await clientPromise;
        const db = client.db('QuizApp_users');
        
        // First check the user's role in the users collection
        const user = await db.collection('users').findOne({ email: userEmail });
        if (user && user.role) {
            return NextResponse.json({ role: user.role });
        }
        
        // Fallback to checking individual collections
        const teacher = await db.collection('teachers').findOne({ email: userEmail });
        if (teacher) {
            // Update the user's role in the main collection
            await db.collection('users').updateOne(
                { email: userEmail },
                { $set: { role: 'teacher' } },
                { upsert: true }
            );
            return NextResponse.json({ role: 'teacher' });
        }

        const student = await db.collection('students').findOne({ email: userEmail });
        if (student) {
            // Update the user's role in the main collection
            await db.collection('users').updateOne(
                { email: userEmail },
                { $set: { role: 'student' } },
                { upsert: true }
            );
            return NextResponse.json({ role: 'student' });
        }

        return NextResponse.json({ role: null });
    } catch (error) {
        console.error('Failed to fetch user role:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch user role',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
